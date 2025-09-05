using System.Collections.Concurrent;
using System.Text.Json;
using ChineseChess.Api.Data;
using ChineseChess.Engine;
using Microsoft.EntityFrameworkCore;

namespace ChineseChess.Api.Game;

public class PersistentGameStore : IGameStore
{
    private readonly AppDbContext _db;
    private readonly BoardSerializer _ser;

    // Hot cache for active games: Id -> GameSession
    private readonly ConcurrentDictionary<Guid, GameSession> _active = new();

    public PersistentGameStore(AppDbContext db, BoardSerializer ser)
    {
        _db = db;
        _ser = ser;
    }

    public GameSession CreateLocal()
    {
        var board = new Board();
        board.InitializeLocalBoard();

        var session = new GameSession(board);
        var id = session.Id;

        var record = new GameRecord
        {
            Id = id,
            StateJson = _ser.ToJson(board),
            MovesJson = "[]",
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow,
            IsFinished = false
        };

        _db.Games.Add(record);
        _db.SaveChanges();

        _active[id] = session;
        return session;
    }

    public GameSession? Get(Guid id)
    {
        if (_active.TryGetValue(id, out var cached))
            return cached;

        var rec = _db.Games.AsNoTracking().FirstOrDefault(g => g.Id == id);
        if (rec is null) return null;

        var board = _ser.FromJson(rec.StateJson);
        var session = new GameSession(board) { };

        _active[id] = session;
        return session;
    }

    public bool TryApplyMove(Guid id, string from, string to, out string? error)
    {
        error = null;

        var session = Get(id);
        if (session is null)
        {
            error = "Game not found.";
            return false;
        }

        // Parse coordinates
        if (!Parser.TryParseCoordinate(from, out var fromPos) || !Parser.TryParseCoordinate(to, out var toPos))
        {
            error = "Invalid coordinate format.";
            return false;
        }

        // Validate move
        if (!session.Board.CanMove(fromPos.row, fromPos.col, toPos.row, toPos.col))
        {
            error = "Illegal move.";
            return false;
        }

        // Apply move
        if (!session.Board.MovePiece(fromPos.row, fromPos.col, toPos.row, toPos.col))
        {
            error = "Move failed.";
            return false;
        }

        // Update in DB (snapshot + append move)
        var rec = _db.Games.FirstOrDefault(g => g.Id == id);
        if (rec is null)
        {
            error = "Game record missing.";
            return false;
        }

        // Append move to MovesJson
        var moves = JsonSerializer.Deserialize<List<string>>(rec.MovesJson) ?? new();
        moves.Add($"{from.ToUpper()}-{to.ToUpper()}");
        rec.MovesJson = JsonSerializer.Serialize(moves);

        // Save snapshot
        rec.StateJson = _ser.ToJson(session.Board);
        rec.UpdatedAtUtc = DateTime.UtcNow;

        _db.SaveChanges();
        return true;
    }


}
