namespace ChineseChess.Api;

public class PlayerPresence
{
    public string ConnectionId { get; init; } = default!;
    public string GameId { get; init; } = default!;
    public string? UserId { get; init; } = default!;   // or email
    public string Color { get; init; } = default!;    // "red" | "black"
}