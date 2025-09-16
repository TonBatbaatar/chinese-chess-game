namespace ChineseChess.Api.Game;

public interface IGameSessionCache
{
    bool TryGet(Guid id, out GameSession session);
    void Set(GameSession session, TimeSpan? ttl = null);
    void Remove(Guid id);
}