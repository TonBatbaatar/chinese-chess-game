using ChineseChess.Api.Data;
using ChineseChess.Engine; // your Board/Piece rules
using Microsoft.EntityFrameworkCore;

using ChineseChess.Api.Game;
using ChineseChess.Api.Mapping;
using ChineseChess.Api.Contracts;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using Microsoft.EntityFrameworkCore.Infrastructure.Internal;
using System.ComponentModel.Design.Serialization;

namespace ChineseChess.Api;

public class GameHub : Hub
{

    private readonly IGameStore _store;
    private readonly ILogger<GameHub> _logger;
    public GameHub(ILogger<GameHub> logger, IGameStore store)
    {
        _store = store;
        _logger = logger;
    }


    private static readonly ConcurrentDictionary<string, PlayerPresence> _connections = new();
    private string? UserId => Context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
    private string? UserEmail => Context.User?.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

    // per-game lock to prevent race conditions
    private static readonly ConcurrentDictionary<Guid, SemaphoreSlim> _locks = new();
    private SemaphoreSlim LockFor(Guid id) => _locks.GetOrAdd(id, _ => new SemaphoreSlim(1, 1));


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

        var gate = LockFor(id);
        await gate.WaitAsync();
        try
        {
            Player? me =
                (session.Board.PlayerRed.PlayerID == UserId) ? session.Board.PlayerRed :
                (session.Board.PlayerBlack.PlayerID == UserId) ? session.Board.PlayerBlack : null;

            if (me != null)
            {
                var old = me.ForfeitCts;
                me.ForfeitCts = null;
                old?.Cancel();
                old?.Dispose();

                me.IsConnected = true;
                me.PlayerConnectionID = Context.ConnectionId;

                // add to connected user dic
                _connections[Context.ConnectionId] = new PlayerPresence
                {
                    ConnectionId = Context.ConnectionId,
                    GameId = gameId,
                    UserId = UserEmail,
                    Color = me.Color.ToString(),
                };

                await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
                await Clients.Caller.SendAsync("State", BoardMapper.ToDto(session.Board), me.Color.ToString());
                await Clients.Group(gameId).SendAsync("Joined", Context.ConnectionId, session.Board.PlayerRed.PlayerEmail, session.Board.PlayerBlack.PlayerEmail);
                // await Clients.Group(gameId).SendAsync("PlayerReconnected", UserId);
                return true;
            }

            var joinColor = "";
            if (session.Board.PlayerRed.PlayerID is null)
            {
                session.Board.PlayerRed.PlayerConnectionID = Context.ConnectionId;
                session.Board.PlayerRed.PlayerID = UserId;
                session.Board.PlayerRed.PlayerEmail = UserEmail;
                session.Board.PlayerRed.IsConnected = true;
                joinColor = "Red";
            }
            else if (session.Board.PlayerBlack.PlayerID is null)
            {
                session.Board.PlayerBlack.PlayerConnectionID = Context.ConnectionId;
                session.Board.PlayerBlack.PlayerID = UserId;
                session.Board.PlayerBlack.PlayerEmail = UserEmail;
                session.Board.PlayerBlack.IsConnected = true;
                joinColor = "Black";
            }
            else
            {
                // game is full : treat as spectator
                await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
                await Clients.Caller.SendAsync("SpectatorJoined", BoardMapper.ToDto(session.Board), session.Board.PlayerRed.PlayerID, session.Board.PlayerBlack.PlayerID);
                return true;
            }

            // add to connected user dic
            var presence = new PlayerPresence
            {
                ConnectionId = Context.ConnectionId,
                GameId = gameId,
                UserId = UserEmail,
                Color = joinColor
            };
            _connections[Context.ConnectionId] = presence;
            await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
            await Clients.Caller.SendAsync("State", BoardMapper.ToDto(session.Board), joinColor);
            await Clients.Group(gameId).SendAsync("Joined", Context.ConnectionId, session.Board.PlayerRed.PlayerEmail, session.Board.PlayerBlack.PlayerEmail);

        }
        finally
        {
            gate.Release();
        }

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
        await Clients.Caller.SendAsync("State", BoardMapper.ToDto(session.Board), session.Board.GetPlayerByID(Context.ConnectionId).Color.ToString());
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
            if (!Guid.TryParse(presence.GameId, out var id))
                return;

            var session = _store.Get(id) ?? throw new SessionNotFoundException(id);
            var board = session.Board;

            var disconnected = board.GetPlayerByID(Context.ConnectionId);
            if (disconnected == null) return;

            disconnected.IsConnected = false;

            // cancel any prior timer and create a fresh CTS
            disconnected.ForfeitCts?.Cancel();
            disconnected.ForfeitCts = new CancellationTokenSource();
            var token = disconnected.ForfeitCts.Token;

            disconnected.DisconnectDeadlineUtc = DateTimeOffset.UtcNow.AddSeconds(10);

            var opponent = board.GetOppnentPlayer(Context.ConnectionId);

            await Groups.RemoveFromGroupAsync(Context.ConnectionId, presence.GameId);
            await Clients.Group(presence.GameId)
                .SendAsync("PlayerDisconnected", presence.UserId, presence.Color, ex?.Message ?? "closed");

            try
            {
                await Task.Delay(TimeSpan.FromSeconds(10), token);

                if (!disconnected.IsConnected && !board.IsGameOver())
                {
                    _store.EndWithWinner(id, opponent, out var error);
                    await Clients.Group(presence.GameId)
                        .SendAsync("MatchEnded", opponent?.PlayerEmail, "opponent disconnected");
                }
            }
            catch (TaskCanceledException)
            {
                _logger.LogInformation("Forfeit timer canceled (player reconnected). Game {GameId}, Conn {ConnId}", id, Context.ConnectionId);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error while handling disconnect for Game {GameId}, Conn {ConnId}", id, Context.ConnectionId);
            }
        }

        await base.OnDisconnectedAsync(ex);
    }


}

