namespace ChineseChess.Api;

public class PlayerPresence
{
    public string ConnectionId { get; init; } = default!;
    public string GameId { get; init; } = default!;
    public string? UserEmail { get; init; } = default!;   // or email
    public string? UserID { get; init; } = default!;
    public string Color { get; init; } = default!;    // "red" | "black"
}