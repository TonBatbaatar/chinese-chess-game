using System.Diagnostics;
using ChineseChess.Engine;

namespace ChineseChess.Api.Game;

public readonly record struct TimeControl(
    TimeSpan Initial,
    TimeSpan Increment
);

public sealed class GameClock
{
    public TimeControl TimeControl { get; }

    // Monotonic time for elapsed measurement
    private readonly Stopwatch _stopwatch = new();
    private long _lastTickMillis;
    private bool _isRunning;

    // For thread-safety (Hub can be multi-threaded)
    private readonly object _lock = new();

    // constructor
    public GameClock(TimeControl timeControl)
    {
        TimeControl = timeControl;
    }


    public void Start()
    {
        lock (_lock)
        {
            if (_isRunning) return;
            _stopwatch.Start();
            _lastTickMillis = _stopwatch.ElapsedMilliseconds;
            _isRunning = true;
        }
    }


    public void Pause(Player currentPlayer)
    {
        lock (_lock)
        {
            if (!_isRunning) return;
            AccrueElapsed_NoLock(currentPlayer);
            _isRunning = false;
        }
    }


    public void Resume()
    {
        lock (_lock)
        {
            if (_isRunning) return;
            _lastTickMillis = _stopwatch.ElapsedMilliseconds;
            _isRunning = true;
        }
    }


    public (TimeSpan red, TimeSpan black) GetRemaining(Board board)
    {
        lock (_lock)
        {
            if (_isRunning)
            {
                // capture without mutating state (don’t apply permanently)
                var elapsedMs = _stopwatch.ElapsedMilliseconds - _lastTickMillis;
                var elapsed = TimeSpan.FromMilliseconds(elapsedMs);
                return board.CurrentPlayer == board.PlayerRed
                    ? (board.PlayerRed.RemainingTime - elapsed, board.PlayerBlack.RemainingTime)
                    : (board.PlayerRed.RemainingTime, board.PlayerBlack.RemainingTime - elapsed);
            }
            return (board.PlayerRed.RemainingTime, board.PlayerBlack.RemainingTime);
        }
    }

    /// <summary>
    /// reduce time for player object
    /// </summary>
    /// <param name="currentPlayer">current player</param>
    public void OnMoveCommitted(Player currentPlayer)
    {
        lock (_lock)
        {
            // Stop and accrue time against current side
            AccrueElapsed_NoLock(currentPlayer);

            // Apply Fischer increment to the mover who just played
            if (TimeControl.Increment > TimeSpan.Zero)
            {
                currentPlayer.RemainingTime += TimeControl.Increment;
            }

            // “Resume” for the new side (just resets last tick)
            _lastTickMillis = _stopwatch.ElapsedMilliseconds;
            _isRunning = true;
        }
    }


    public Player? GetFlaggedPlayer(Board board)
    {
        lock (_lock)
        {
            var (r, b) = GetRemaining(board);
            if (r <= TimeSpan.Zero) return board.PlayerRed;
            if (b <= TimeSpan.Zero) return board.PlayerBlack;
            return null;
        }
    }


    private void AccrueElapsed_NoLock(Player currentPlayer)
    {
        if (!_isRunning) return;
        var nowMs = _stopwatch.ElapsedMilliseconds;
        var elapsedMs = nowMs - _lastTickMillis;
        if (elapsedMs <= 0) return;

        var elapsed = TimeSpan.FromMilliseconds(elapsedMs);
        currentPlayer.RemainingTime -= elapsed;

        _lastTickMillis = nowMs;
        _isRunning = false;
    }

}

