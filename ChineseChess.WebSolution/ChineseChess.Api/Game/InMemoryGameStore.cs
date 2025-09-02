// ChineseChess.Api/Game/InMemoryGameStore.cs
using System.Collections.Concurrent;
using ChineseChess.Engine;

namespace ChineseChess.Api.Game;

public interface IGameStore
{
    GameSession CreateLocal();
    GameSession? Get(Guid id);
    bool TryApplyMove(Guid id, string from, string to, out string? error);
}

public class InMemoryGameStore : IGameStore
{
    private readonly ConcurrentDictionary<Guid, GameSession> _games = new();

    public GameSession CreateLocal()
    {
        var board = new Board();
        board.InitializeLocalBoard(); // use existing method
        var session = new GameSession(board);
        _games[session.Id] = session;
        return session;
    }

    public GameSession? Get(Guid id) => _games.TryGetValue(id, out var s) ? s : null;

    public bool TryApplyMove(Guid id, string from, string to, out string? error)
    {
        error = null;

        // get game by id
        var game = Get(id);
        if (game is null) { error = "Game not found."; return false; }

        // check if the format is correct
        if (!TryParseCoordinate(from, out var fromPos) || !TryParseCoordinate(to, out var toPos))
        {
            error = "Invalid coordinate format. Use e.g. A3 or H10.";
            return false;
        }

        // Optional: ensure player turn matches your engine rules, e.g., red starts
        // Here we just try the move via engine validation:
        if (!game.Board.CanMove(fromPos.row, fromPos.col, toPos.row, toPos.col))
        {
            error = "Illegal move.";
            return false;
        }

        // Make the move
        if (!game.Board.MovePiece(fromPos.row, fromPos.col, toPos.row, toPos.col))
        {
            error = "Move failed.";
            return false;
        }

        game.Moves.Add($"{from}-{to}");
        return true;
    }

    private static bool TryParseCoordinate(string coord, out (int row, int col) pos)
    {
        pos = (-1, -1);
        coord = coord.Trim().ToUpper();

        // Accept A1 .. I10
        if (coord.Length < 2 || coord.Length > 3) return false;

        char colChar = coord[0];
        if (colChar < 'A' || colChar > 'I') return false;

        if (!int.TryParse(coord[1..], out int rowNum)) return false;
        if (rowNum < 1 || rowNum > 10) return false;

        int col = colChar - 'A';
        int row = rowNum - 1; // top-to-bottom 1..10 -> 0..9
        pos = (row, col);
        return true;
    }
}
