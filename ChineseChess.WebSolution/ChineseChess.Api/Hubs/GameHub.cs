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
using Microsoft.VisualBasic;

namespace ChineseChess.Api;

public class GameHub : Hub
{

    private readonly IGameStore _store;
    private readonly ILogger<GameHub> _logger;
    private readonly ClockService _clockService;
    public GameHub(ILogger<GameHub> logger, IGameStore store, ClockService clockService)
    {
        _store = store;
        _logger = logger;
        _clockService = clockService;
    }


    private static readonly ConcurrentDictionary<string, PlayerPresence> _connections = new();
    private string? UserId => Context.User?.Identity?.Name;
    private string? UserEmail => Context.User?.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

    // per-game lock to prevent race conditions
    private static readonly ConcurrentDictionary<Guid, SemaphoreSlim> _locks = new();
    private SemaphoreSlim LockFor(Guid id) => _locks.GetOrAdd(id, _ => new SemaphoreSlim(1, 1));

    // clock broadcasters per game
    private static readonly ConcurrentDictionary<string, Timer> _clockTimers = new();


    /// <summary>
    /// Create a new game and auto-join caller to its room
    /// </summary>
    /// <returns>GameID, currentTurn, BoardDTO, seat</returns>
    public async Task<CreateGameResult> CreateGame(string timeControl, string guestID)
    {
        var parts = timeControl.Split("|");
        if (!int.TryParse(parts[0], out int initialMinutes) ||
        !int.TryParse(parts[1], out int incrementSeconds))
        {
            throw new FormatException($"Invalid numbers in time control string: '{timeControl}'.");
        }

        var tc = new TimeControl(TimeSpan.FromMinutes(initialMinutes), TimeSpan.FromSeconds(incrementSeconds));
        var session = _store.CreateGame(tc, UserId ?? guestID);

        string room = session.Id.ToString();

        // assign red player as the creater by default for now
        session.Board.PlayerRed.PlayerConnectionID = Context.ConnectionId;
        session.Board.PlayerRed.PlayerID = UserId ?? guestID;
        session.Board.PlayerRed.PlayerEmail = UserEmail;
        session.Board.PlayerRed.IsConnected = true;
        session.Board.PlayerRed.RemainingTime = session.Clock.TimeControl.Initial;

        // add to connected user dic
        var presence = new PlayerPresence
        {
            ConnectionId = Context.ConnectionId,
            GameId = room,
            UserID = UserId ?? guestID,
            UserEmail = UserEmail,
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
    public async Task<bool> JoinGame(string gameId, string guestID)
    {
        if (!Guid.TryParse(gameId, out var id)) return false;
        var session = _store.Get(id);
        if (session is null) return false;

        var gate = LockFor(id);
        await gate.WaitAsync();
        try
        {
            Player? me =
                (session.Board.PlayerRed.PlayerID == (UserId ?? guestID)) ? session.Board.PlayerRed :
                (session.Board.PlayerBlack.PlayerID == (UserId ?? guestID)) ? session.Board.PlayerBlack : null;

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
                    UserID = UserId ?? guestID,
                    UserEmail = UserEmail,
                    Color = me.Color.ToString(),
                };

                await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
                await Clients.Caller.SendAsync("State", BoardMapper.ToDto(session.Board), me.Color.ToString());
                await Clients.Group(gameId).SendAsync("Joined", Context.ConnectionId, session.Board.PlayerRed.PlayerID, session.Board.PlayerBlack.PlayerID);
                // await Clients.Group(gameId).SendAsync("PlayerReconnected", UserId);
                return true;
            }

            var joinColor = "";
            if (session.Board.PlayerRed.PlayerID is null)
            {
                session.Board.PlayerRed.PlayerConnectionID = Context.ConnectionId;
                session.Board.PlayerRed.PlayerID = UserId ?? guestID;
                session.Board.PlayerRed.PlayerEmail = UserEmail;
                session.Board.PlayerRed.IsConnected = true;
                session.Board.PlayerRed.RemainingTime = session.Clock.TimeControl.Initial;
                joinColor = "Red";
            }
            else if (session.Board.PlayerBlack.PlayerID is null)
            {
                session.Board.PlayerBlack.PlayerConnectionID = Context.ConnectionId;
                session.Board.PlayerBlack.PlayerID = UserId ?? guestID;
                session.Board.PlayerBlack.PlayerEmail = UserEmail;
                session.Board.PlayerBlack.IsConnected = true;
                session.Board.PlayerBlack.RemainingTime = session.Clock.TimeControl.Initial;
                joinColor = "Black";
                _store.PlayerJoined(id, UserId ?? guestID, out var error);
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
                UserID = UserId ?? guestID,
                UserEmail = UserEmail,
                Color = joinColor
            };
            _connections[Context.ConnectionId] = presence;
            await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
            session.Clock.Start(); //start the clock
            _clockService.StartClockBroadcast(gameId, session); // start clock broadcaster
            await Clients.Caller.SendAsync("State", BoardMapper.ToDto(session.Board), joinColor);
            await Clients.Group(gameId).SendAsync("Joined", Context.ConnectionId, session.Board.PlayerRed.PlayerID, session.Board.PlayerBlack.PlayerID);

        }
        finally
        {
            gate.Release();
        }

        return true;
    }


    /// <summary>
    /// Make a move: server validates via engine and broadcasts updated state if valid
    /// </summary>
    /// <param name="gameId"></param>
    /// <param name="from"></param>
    /// <param name="to"></param>
    /// <returns></returns>
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

        var gate = LockFor(id);
        await gate.WaitAsync();
        try
        {
            // Flagged validation
            var flagged = session.Clock.GetFlaggedPlayer(session.Board);
            var CurrentPlayer = board.GetPlayerByID(Context.ConnectionId);
            Player opponent = CurrentPlayer == board.PlayerRed ? board.PlayerBlack : board.PlayerRed;
            if (flagged != null)
            {
                await Clients.Group(gameId).SendAsync("MatchEnded", opponent.PlayerID, "opponent flagged!");
                _clockService.StopClockBroadcast(gameId);
                return new MoveResponse(false, "Game Ended.", BoardMapper.ToDto(board));
            }

            // part 2: move validation
            // 2.1: Seat must match current turn
            if (!CurrentPlayer.IsMyTurn)
            {
                return new MoveResponse(false, "Not your turn.", BoardMapper.ToDto(board));
            }
            // 2.2: Coordinate validation
            if (!Parser.TryParseCoordinate(from, out var fromPos))
                return new MoveResponse(false, "Bad 'from' coordinate.", BoardMapper.ToDto(board));
            if (!Parser.TryParseCoordinate(to, out var toPos))
                return new MoveResponse(false, "Bad 'to' coordinate.", BoardMapper.ToDto(board));
            // 2.3: piece owner validation
            var movingPiece = board.Grid[fromPos.row, fromPos.col];
            if (movingPiece.Owner != CurrentPlayer)
            {
                return new MoveResponse(false, "You can only move your own pieces.", BoardMapper.ToDto(board));
            }
            // 2.4: Is under check validation
            if (board.SimulateMove(fromPos.row, fromPos.col, toPos.row, toPos.col, out var sim))
            {
                bool inCheck = board.IsInCheck(CurrentPlayer);
                board.RevertSim(sim);

                if (inCheck)
                    return new MoveResponse(false, "Move failed, you are under check.", BoardMapper.ToDto(board)); ;
            }
            // 2.5: Rule validation --> Delegate to store for full rules + persistence
            if (!_store.TryApplyMove(id, from, to, out var error))
                return new MoveResponse(false, error ?? "Move rejected", BoardMapper.ToDto(board));


            session.Clock.OnMoveCommitted(CurrentPlayer);
            // Broadcast new state
            await Clients.Group(gameId).SendAsync("MoveMade", new { from, to }, BoardMapper.ToDto(board));


            // part 3: game over check
            // 3.1：validate draw rule
            if (board.IsDraw(out var reason))
            {
                _store.GameDraw(id, out error);
                await Clients.Group(gameId).SendAsync("GameDraw", reason);
                _clockService.StopClockBroadcast(gameId);
            }
            // 3.2: validate checkmate
            if (board.IsGameOver(opponent))
            {
                _store.EndWithWinner(id, CurrentPlayer, out var errorMessage);
                await Clients.Group(gameId).SendAsync("MatchEnded", CurrentPlayer.PlayerID, "Checkmate!");
                _clockService.StopClockBroadcast(gameId);
            }

            return new MoveResponse(true, null, BoardMapper.ToDto(board));
        }
        finally
        {
            gate.Release();
        }
    }


    /// <summary>
    /// Let a client ask for the latest state explicitly
    /// </summary>
    /// <param name="gameId"></param>
    /// <returns></returns>
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
                .SendAsync("PlayerDisconnected", presence.UserID, presence.Color, ex?.Message ?? "closed");

            try
            {
                await Task.Delay(TimeSpan.FromSeconds(10), token);

                if (!disconnected.IsConnected && !board.IsGameOver(disconnected) && !board.IsGameOver(opponent))
                {
                    _store.EndWithWinner(id, opponent, out var error);
                    await Clients.Group(presence.GameId).SendAsync("MatchEnded", opponent?.PlayerID, "opponent disconnected");
                    _clockService.StopClockBroadcast(presence.GameId);
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


    public async Task SendChatMessage(string gameId, string text)
    {
        // game validation
        if (!Guid.TryParse(gameId, out var id)) return;
        var session = _store.Get(id);
        if (session is null) return;

        if (string.IsNullOrWhiteSpace(text)) return;
        text = text.Trim();
        if (text.Length > 2000) text = text.Substring(0, 2000);

        // basic rate limiting
        var key = Context.ConnectionId;
        var now = DateTimeOffset.UtcNow;
        string shortFmt = now.ToString("yyyy-MM-dd HH:mm:ss");

        var currentPlayer = session.Board.GetPlayerByID(Context.ConnectionId);

        await Clients.Group(gameId).SendAsync("Message", currentPlayer.PlayerID, text, shortFmt);
    }

    public async Task Resign(string gameId)
    {
        // game validation
        if (!Guid.TryParse(gameId, out var id)) return;
        var session = _store.Get(id);
        if (session is null) return;

        var opp = session.Board.GetOppnentPlayer(Context.ConnectionId);

        _store.EndWithWinner(id, opp, out var error);
        await Clients.Group(gameId).SendAsync("MatchEnded", opp.PlayerID, "opponent resigned.");
        _clockService.StopClockBroadcast(gameId);
    }

    public async Task OfferDraw(string gameId)
    {
        // game validation
        if (!Guid.TryParse(gameId, out var id)) return;
        var session = _store.Get(id);
        if (session is null) return;

        var opp = session.Board.GetOppnentPlayer(Context.ConnectionId);

        await Clients.Group(gameId).SendAsync("DrawOffer", opp.PlayerID);
    }

    public async Task OfferResponse(string gameId, bool accept)
    {
        // game validation
        if (!Guid.TryParse(gameId, out var id)) return;
        var session = _store.Get(id);
        if (session is null) return;

        var currentPlayer = session.Board.GetPlayerByID(Context.ConnectionId);
        var opp = session.Board.GetOppnentPlayer(Context.ConnectionId);
        string message = "";
        var now = DateTimeOffset.UtcNow;
        string shortFmt = now.ToString("yyyy-MM-dd HH:mm:ss");

        if (accept)
        {
            message = "I accept your draw offer! GG!";
            _store.GameDraw(id, out var error);
            await Clients.Group(gameId).SendAsync("GameDraw", "player agreement.");
            _clockService.StopClockBroadcast(gameId);
        }
        else
        {
            message = "I decline your draw offer!";
        }

        await Clients.Group(gameId).SendAsync("Message", currentPlayer.PlayerID, message, shortFmt);
    }

}

