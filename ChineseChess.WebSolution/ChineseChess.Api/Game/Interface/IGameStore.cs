using ChineseChess.Engine;

namespace ChineseChess.Api.Game;

public interface IGameStore
{
    GameSession CreateGame(TimeControl tc, string? creatorUserId = null);
    GameSession? Get(Guid id);
    bool TryApplyMove(Guid id, string from, string to, out string? error);
    bool EndWithWinner(Guid id, Player winner, out string? error);
}