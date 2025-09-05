namespace ChineseChess.Api.Game;

public interface IGameStore
{
    GameSession CreateLocal();
    GameSession? Get(Guid id);
    bool TryApplyMove(Guid id, string from, string to, out string? error);
}