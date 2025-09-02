// ChineseChess.Api/Contracts/GameDtos.cs
namespace ChineseChess.Api.Contracts;

public record CreateGameResponse(Guid GameId, string CurrentTurn, object Board);
public record MoveRequest(string From, string To);
public record MoveResponse(bool Ok, string? Error, object? Board);
