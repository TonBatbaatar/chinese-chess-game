namespace ChineseChess.Api.Game;

public interface IGameStore
{
    GameSession CreateLocal(string? creatorUserId = null);
    GameSession? Get(Guid id);
    bool TryApplyMove(Guid id, string from, string to, out string? error);
}