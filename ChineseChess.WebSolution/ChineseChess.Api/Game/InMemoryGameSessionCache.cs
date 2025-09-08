using Microsoft.Extensions.Caching.Memory;

namespace ChineseChess.Api.Game;

public class InMemoryGameSessionCache : IGameSessionCache
{
    private readonly IMemoryCache _cache;
    private static readonly TimeSpan DefaultTtl = TimeSpan.FromHours(2);

    public InMemoryGameSessionCache(IMemoryCache cache) => _cache = cache;

    private static string Key(Guid id) => $"game:{id}";

    public bool TryGet(Guid id, out GameSession session)
        => _cache.TryGetValue(Key(id), out session!);

    public void Set(GameSession session, TimeSpan? ttl = null)
    {
        _cache.Set(Key(session.Id), session,
            new MemoryCacheEntryOptions
            {
                SlidingExpiration = ttl ?? DefaultTtl,
                Size = 1 // configure SizeLimit on IMemoryCache
            });
    }

    public void Remove(Guid id) => _cache.Remove(Key(id));
}
