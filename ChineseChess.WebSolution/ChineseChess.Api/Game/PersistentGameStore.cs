using System.Collections.Concurrent;
using System.Text.Json;
using System.Security.Claims;
using ChineseChess.Api.Data;
using ChineseChess.Engine;
using Microsoft.EntityFrameworkCore;

namespace ChineseChess.Api.Game;

public class PersistentGameStore : IGameStore
{
    private readonly AppDbContext _db; // Scoped
    private readonly BoardSerializer _ser; // Singleton
    private readonly IGameSessionCache _cache; // Singleton


    public PersistentGameStore(AppDbContext db, BoardSerializer ser, IGameSessionCache cache)
    {
        _db = db;
        _ser = ser;
        _cache = cache;
    }


    public GameSession CreateGame(TimeControl tc, string? creatorUserId = null)
    {
        var board = new Board();
        board.InitializeBoard();

        var session = new GameSession(board, tc);
        var id = session.Id;

        // warm cache
        _cache.Set(session);

        var record = new GameRecord
        {
            Id = id,
            StateJson = _ser.ToJson(board),
            MovesJson = "[]",
            CreatorUserId = creatorUserId, // may be null (guest)
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow,
            IsFinished = false,
            Initial = session.Clock.TimeControl.Initial,
            Increment = session.Clock.TimeControl.Increment
        };

        _db.Games.Add(record);
        _db.SaveChanges();

        return session;
    }



    public GameSession? Get(Guid id)
    {
        if (_cache.TryGet(id, out var cached))
            return cached;

        var rec = _db.Games.AsNoTracking().FirstOrDefault(g => g.Id == id);
        if (rec is null) return null;

        var board = _ser.FromJson(rec.StateJson);
        var tc = new TimeControl(rec.Initial, rec.Increment);
        var session = new GameSession(board, tc)
        {
            // (optionally rehydrate seats from DB if later)
        };

        _cache.Set(session);
        return session;
    }


    /// <summary>
    /// Store the game with end state to db
    /// </summary>
    /// <param name="id">game id</param>
    /// <param name="winner">winner</param>
    /// <param name="error"></param>
    /// <returns></returns>
    public bool EndWithWinner(Guid id, Player winner, out string? error)
    {

        error = null;

        var session = Get(id);
        if (session is null)
        {
            error = "Game not found.";
            return false;
        }

        // get game record
        var rec = _db.Games.FirstOrDefault(g => g.Id == id);
        if (rec is null)
        {
            error = "Game record missing.";
            return false;
        }

        // Save snapshot
        rec.StateJson = _ser.ToJson(session.Board);
        rec.UpdatedAtUtc = DateTime.UtcNow;
        rec.IsFinished = true;

        _db.SaveChanges();
        return true;
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

        var board = session.Board;
        var moving = board.Grid[fromPos.row, fromPos.col];

        // 1) Must move something
        if (moving == null || moving.Type == PieceType.None)
        {
            error = "No piece at source.";
            return false;
        }

        // 2) Must be current player's piece (TURN ENFORCEMENT)
        if (moving.Owner != board.CurrentPlayer)
        {
            error = "Not your turn.";
            return false;
        }

        // 3) Regular legality checks (your existing rules)
        // Validate move
        if (!session.Board.CanMove(fromPos.row, fromPos.col, toPos.row, toPos.col))
        {
            error = "Illegal move.";
            return false;
        }

        // 4) Apply move
        if (!session.Board.MovePiece(fromPos.row, fromPos.col, toPos.row, toPos.col))
        {
            error = "Move failed.";
            return false;
        }

        // 5) switch player with a successive move
        session.Board.SwitchPlayer();

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
