// ChineseChess.Api/Game/InMemoryGameStore.cs
using System.Collections.Concurrent;
using ChineseChess.Engine;

namespace ChineseChess.Api.Game;

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
        if (!Parser.TryParseCoordinate(from, out var fromPos) || !Parser.TryParseCoordinate(to, out var toPos))
        {
            error = "Invalid coordinate format. Use e.g. A3 or H10.";
            return false;
        }

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
}
