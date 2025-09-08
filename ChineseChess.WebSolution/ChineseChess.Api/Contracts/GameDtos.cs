namespace ChineseChess.Api.Contracts;

public record CreateGameResult(Guid GameId, string CurrentTurn, object Board, string Seat);  // seat: "Red" or "Black"
public record MoveRequest(string From, string To);
public record MoveResponse(bool Ok, string? Error, object? Board);
