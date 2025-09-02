using ChineseChess.Api.Data;
using ChineseChess.Engine; // your Board/Piece rules
using Microsoft.EntityFrameworkCore;

using ChineseChess.Api.Game;
using ChineseChess.Api.Mapping;
using Microsoft.AspNetCore.SignalR;

namespace ChineseChess.Api;

public class GameHub : Hub
{

    // v0.1.0: In memory (without Database) version
    private readonly IGameStore _store;

    public GameHub(IGameStore store) => _store = store;

    // Create a new local game and auto-join caller to its room
    public async Task<CreateGameResult> CreateGame()
    {
        var session = _store.CreateLocal();        // uses existing board.InitializeLocalBoard()
        string room = session.Id.ToString();

        await Groups.AddToGroupAsync(Context.ConnectionId, room);

        // send initial board state only to the creator
        var boardDto = BoardMapper.ToDto(session.Board);
        return new CreateGameResult(room, boardDto);
    }

    // Join existing game by id (room)
    public async Task<bool> JoinGame(string gameId)
    {
        if (!Guid.TryParse(gameId, out var id)) return false;
        var session = _store.Get(id);
        if (session is null) return false;

        await Groups.AddToGroupAsync(Context.ConnectionId, gameId);

        // Send current state to the client who just joined
        var boardDto = BoardMapper.ToDto(session.Board);
        await Clients.Caller.SendAsync("State", boardDto);
        // Notify room someone joined
        await Clients.Group(gameId).SendAsync("Joined", Context.ConnectionId);
        return true;
    }

    // Make a move: server validates via engine and broadcasts updated state if valid
    public async Task<MoveResult> MakeMove(string gameId, string from, string to)
    {
        if (!Guid.TryParse(gameId, out var id))
            return new MoveResult(false, "Invalid game id");

        if (!_store.TryApplyMove(id, from, to, out var error))
            return new MoveResult(false, error ?? "Move rejected");

        var session = _store.Get(id)!;
        var boardDto = BoardMapper.ToDto(session.Board);

        // broadcast to everyone in the room
        await Clients.Group(gameId).SendAsync("MoveMade", new { from, to }, boardDto);
        return new MoveResult(true, null);
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
}
public record CreateGameResult(string GameId, object Board);
public record MoveResult(bool Ok, string? Error);
