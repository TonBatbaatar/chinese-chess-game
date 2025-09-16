using ChineseChess.Api.Data;
using ChineseChess.Engine; // your Board/Piece rules
using Microsoft.EntityFrameworkCore;

using ChineseChess.Api.Game;
using ChineseChess.Api.Mapping;
using ChineseChess.Api.Contracts;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using Microsoft.EntityFrameworkCore.Infrastructure.Internal;

namespace ChineseChess.Api;

public class GameHub : Hub
{

    private readonly IGameStore _store;
    public GameHub(IGameStore store) => _store = store;


    private static readonly ConcurrentDictionary<string, PlayerPresence> _connections = new();
    private string? UserId => Context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
    private string? UserEmail => Context.User?.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;


    /// <summary>
    /// Create a new game and auto-join caller to its room
    /// </summary>
    /// <returns>GameID, currentTurn, BoardDTO, seat</returns>
    public async Task<CreateGameResult> CreateGame()
    {
        var session = _store.CreateGame(UserId);

        string room = session.Id.ToString();

        // assign red player as the creater by default for now
        session.Board.PlayerRed.PlayerConnectionID = Context.ConnectionId;
        session.Board.PlayerRed.PlayerID = UserId;
        session.Board.PlayerRed.PlayerEmail = UserEmail;
        session.Board.PlayerRed.IsConnected = true;

        // add to connected user dic
        var presence = new PlayerPresence
        {
            ConnectionId = Context.ConnectionId,
            GameId = room,
            UserId = UserEmail,
            Color = "Red"
        };
        _connections[Context.ConnectionId] = presence;

        // add to async group
        await Groups.AddToGroupAsync(Context.ConnectionId, room);

        // send initial board state only to the creator
        var boardDto = BoardMapper.ToDto(session.Board);

        return new CreateGameResult(session.Id, "Red", boardDto, "Red"); //GameID, currentTurn, BoardDTO, seat
    }


    /// <summary>
    /// Join existing game by id (room)
    /// </summary>
    /// <param name="gameId">join game by id</param>
    /// <returns></returns>
    public async Task<bool> JoinGame(string gameId)
    {
        if (!Guid.TryParse(gameId, out var id)) return false;
        var session = _store.Get(id);
        if (session is null) return false;

        // set black player as later joiner
        session.Board.PlayerBlack.PlayerConnectionID = Context.ConnectionId;
        session.Board.PlayerBlack.PlayerID = UserId;
        session.Board.PlayerBlack.PlayerEmail = UserEmail;
        session.Board.PlayerBlack.IsConnected = true;

        // add to connected user dic
        var presence = new PlayerPresence
        {
            ConnectionId = Context.ConnectionId,
            GameId = gameId,
            UserId = UserEmail,
            Color = "Black"
        };
        _connections[Context.ConnectionId] = presence;
        // add to async group
        await Groups.AddToGroupAsync(Context.ConnectionId, gameId);

        // Send current state to the client who just joined
        var boardDto = BoardMapper.ToDto(session.Board);

        await Clients.Caller.SendAsync("State", boardDto);

        // Notify room someone joined
        await Clients.Group(gameId).SendAsync("Joined", Context.ConnectionId, session.Board.PlayerRed.PlayerEmail, session.Board.PlayerBlack.PlayerEmail);
        return true;
    }


    // Make a move: server validates via engine and broadcasts updated state if valid
    public async Task<MoveResponse> MakeMove(string gameId, string from, string to)
    {
        // part 1: basic validation
        // 1.1: validate game ID
        if (!Guid.TryParse(gameId, out var id))
            return new MoveResponse(false, "Invalid game id", null);
        // 1.2: validate session ID
        var session = _store.Get(id);
        if (session is null)
            return new MoveResponse(false, "Game not found", null);
        // 1.3: validate board
        var board = session.Board;
        if (board is null)
            return new MoveResponse(false, "Board not initialized.", null);


        // part 2: move validation
        // 2.1: Seat must match current turn
        var CurrentPlayer = board.GetPlayerByID(Context.ConnectionId);
        if (!CurrentPlayer.IsMyTurn)
        {
            return new MoveResponse(false, "Not your turn.", BoardMapper.ToDto(board));
        }
        // 2.2: Coordinate validation
        if (!Parser.TryParseCoordinate(from, out var fromPos))
            return new MoveResponse(false, "Bad 'from' coordinate.", BoardMapper.ToDto(board));

        // 2.3: piece owner validation
        var movingPiece = board.Grid[fromPos.row, fromPos.col];
        if (movingPiece.Owner != CurrentPlayer)
        {
            return new MoveResponse(false, "You can only move your own pieces.", BoardMapper.ToDto(board));
        }
        // 2.4: Rule validation --> Delegate to store for full rules + persistence
        if (!_store.TryApplyMove(id, from, to, out var error))
            return new MoveResponse(false, error ?? "Move rejected", BoardMapper.ToDto(board));



        // Broadcast new state
        await Clients.Group(gameId).SendAsync("MoveMade", new { from, to }, BoardMapper.ToDto(board));
        return new MoveResponse(true, null, BoardMapper.ToDto(board));
    }


    // Let a client ask for the latest state explicitly
    public async Task<bool> RequestState(string gameId)
    {
        if (!Guid.TryParse(gameId, out var id)) return false;
        var session = _store.Get(id);
        if (session is null) return false;
        await Clients.Caller.SendAsync("State", BoardMapper.ToDto(session.Board));
        return true;
    }

    /// <summary>
    /// this methond will called when one clinet disconnected
    /// </summary>
    /// <param name="ex"></param>
    /// <returns></returns>
    public override async Task OnDisconnectedAsync(Exception? ex)
    {


        if (_connections.TryRemove(Context.ConnectionId, out var presence))
        {

            //get session by game room id
            Guid.TryParse(presence.GameId, out var id);
            var session = _store.Get(id);
            if (session == null) throw new SessionNotFoundException(id);

            // get board
            var board = session.Board;
            var disconnectedPlaer = board.GetPlayerByID(Context.ConnectionId);
            disconnectedPlaer.IsConnected = false;

            // Don’t stack multiple timers
            disconnectedPlaer.ForfeitCts?.Cancel();
            disconnectedPlaer.ForfeitCts = new CancellationTokenSource();

            disconnectedPlaer.DisconnectDeadlineUtc = DateTimeOffset.UtcNow.AddSeconds(10);

            var oppnentPlayer = board.GetOppnentPlayer(Context.ConnectionId);

            _ = Task.Run(async () =>
            {
                try
                {
                    await Task.Delay(TimeSpan.FromSeconds(10), disconnectedPlaer.ForfeitCts.Token);

                    // After delay, if still disconnected and match not over -> forfeit
                    if (!disconnectedPlaer.IsConnected && !board.IsGameOver())
                    {

                        _store.EndWithWinner(id, oppnentPlayer, out var error);

                        // Notify opponent (and, if they reconnect later, show final state)
                        await Clients.Group(presence.GameId).SendAsync("MatchEnded", new { winner = oppnentPlayer.PlayerEmail, reason = "opponent_disconnected" });
                    }
                }
                catch (TaskCanceledException) { /* reconnect canceled the timer */ }
            });


            await Groups.RemoveFromGroupAsync(Context.ConnectionId, presence.GameId);

            // notify the remaining player(s)
            await Clients.Group(presence.GameId).SendAsync("PlayerDisconnected", presence.UserId, presence.Color, ex?.Message ?? "closed");
        }

        await base.OnDisconnectedAsync(ex);
    }

}

