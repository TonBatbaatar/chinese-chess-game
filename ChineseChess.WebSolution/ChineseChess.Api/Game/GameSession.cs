using ChineseChess.Engine;

namespace ChineseChess.Api.Game;

public class GameSession
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public Board Board { get; init; }

    // In-memory seat assignment for live players
    public string? RedConnectionId { get; set; }
    public string? BlackConnectionId { get; set; }

    // if the player has login, also stamp user IDs
    public string? RedUserId { get; set; }
    public string? BlackUserId { get; set; }

    public List<string> Moves { get; } = new(); // store simple text like "A3-B3" for now

    public GameSession(Board board) => Board = board;

    public string? SeatOf(string connectionId)
            => connectionId == RedConnectionId ? "Red"
            : connectionId == BlackConnectionId ? "Black"
            : null;

}