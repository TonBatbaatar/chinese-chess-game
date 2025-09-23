using System.Collections.Concurrent;
using ChineseChess.Api.Game;
using Microsoft.AspNetCore.SignalR;

namespace ChineseChess.Api;

public class ClockService
{
    private readonly IHubContext<GameHub> _hubContext;
    private readonly ConcurrentDictionary<string, Timer> _clockTimers = new();

    public ClockService(IHubContext<GameHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public void StartClockBroadcast(string gameId, GameSession session)
    {
        var timer = new Timer(async _ =>
        {
            var (redRemaining, blackRemaining) = session.Clock.GetRemaining(session.Board);
            var redRemainingString = redRemaining.ToString(@"mm\:ss");
            var blackRemainingString = blackRemaining.ToString(@"mm\:ss");

            await _hubContext.Clients.Group(gameId)
                .SendAsync("ClockUpdate", redRemainingString, blackRemainingString);
        },
        null,
        dueTime: 0,
        period: 250);

        _clockTimers[gameId] = timer;
    }


    public void StopClockBroadcast(string gameId)
    {
        if (_clockTimers.TryRemove(gameId, out var t))
        {
            t.Dispose();
        }
    }
}
