using ChineseChess.Api.Data;
using ChineseChess.Engine; // your Board/Piece rules
using Microsoft.EntityFrameworkCore;

using ChineseChess.Api.Game;
using ChineseChess.Api.Mapping;
using ChineseChess.Api.Contracts;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace ChineseChess.Api;

public class GameHub : Hub
{

    private readonly IGameStore _store;
    private static readonly ConcurrentDictionary<string, PlayerPresence> _connections = new();

    public GameHub(IGameStore store) => _store = store;

    private string? UserId => Context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
    private string? UserEmail => Context.User?.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

    // Create a new local game and auto-join caller to its room
    public async Task<CreateGameResult> CreateGame()
    {
        var userId = UserId;
        var session = _store.CreateLocal(userId);

        string room = session.Id.ToString();

        // Creator becomes Red by default (connection-based)
        session.RedConnectionId = Context.ConnectionId;
        session.RedUserId ??= UserId;

        session.RedEmail = UserEmail;

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

        return new CreateGameResult(session.Id, session.Board.CurrentPlayer.Color.ToString(), boardDto, "Red");
    }


    // Join existing game by id (room)
    public async Task<bool> JoinGame(string gameId)
    {
        if (!Guid.TryParse(gameId, out var id)) return false;
        var session = _store.Get(id);
        if (session is null) return false;

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

        // Auto-assign Black if free, otherwise leave as spectator
        if (session.BlackConnectionId is null && Context.ConnectionId != session.RedConnectionId)
        {
            session.BlackConnectionId = Context.ConnectionId;
            session.BlackUserId ??= UserId;
        }

        session.BlackEmail = UserEmail;

        // Send current state to the client who just joined
        var boardDto = BoardMapper.ToDto(session.Board);
        await Clients.Caller.SendAsync("State", boardDto);

        // Notify room someone joined
        await Clients.Group(gameId).SendAsync("Joined", Context.ConnectionId, session.RedEmail, session.BlackEmail);
        return true;
    }


    // Make a move: server validates via engine and broadcasts updated state if valid
    public async Task<MoveResponse> MakeMove(string gameId, string from, string to)
    {
        if (!Guid.TryParse(gameId, out var id))
            return new MoveResponse(false, "Invalid game id", null);

        var session = _store.Get(id);
        if (session is null)
            return new MoveResponse(false, "Game not found", null);

        var board = session.Board;
        if (board is null)
            return new MoveResponse(false, "Board not initialized.", null);

        var callerSeat = session.SeatOf(Context.ConnectionId);
        if (callerSeat is null)
            return new MoveResponse(false, "You are a spectator. Claim a seat.", BoardMapper.ToDto(board));

        var expectedSeat = board.CurrentPlayer.Color.ToString(); // "Red" or "Black"

        // 1) Seat must match current turn
        if (!string.Equals(callerSeat, expectedSeat, StringComparison.OrdinalIgnoreCase))
            return new MoveResponse(false, "Not your turn.", BoardMapper.ToDto(board));

        // 2) Must be moving your own color’s piece
        if (!Parser.TryParseCoordinate(from, out var fromPos))
            return new MoveResponse(false, "Bad 'from' coordinate.", BoardMapper.ToDto(board));

        var moving = board.Grid[fromPos.row, fromPos.col];
        var movingOwner = moving.Owner?.Color.ToString(); // "Red"/"Black"/"None"

        if (!string.Equals(movingOwner, callerSeat, StringComparison.OrdinalIgnoreCase))
            return new MoveResponse(false, "You can only move your own pieces.", BoardMapper.ToDto(board));

        // 3) Delegate to store for full rules + persistence
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
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, presence.GameId);

            // notify the remaining player(s)
            await Clients.Group(presence.GameId).SendAsync("PlayerDisconnected", presence.UserId, presence.Color, ex?.Message ?? "closed");
        }

        await base.OnDisconnectedAsync(ex);
    }

}

