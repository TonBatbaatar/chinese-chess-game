namespace ChineseChess.Api.Contracts.Replays;

public sealed record ReplayListItemDto(
    Guid Id,
    string? RedUserId,
    string? BlackUserId,
    string TimeControl,      // e.g., "10|0"
    bool IsFinished,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc,
    int MoveCount,           // derived from MovesJson
    string? Result,
    string? MovesJson
);

public sealed record ReplayDetailDto(
    Guid Id,
    string? RedUserId,
    string? BlackUserId,
    string TimeControl,
    string? Result,
    string? MovesJson
);

public sealed record ReplayQueryDto(
    string? UserId = null,   // filter games where user participated (creator/red/black)
    bool? Finished = null,
    string? Tc = null,       // "10|0" or "initial|increment"
    DateTime? FromUtc = null,
    DateTime? ToUtc = null,
    int Page = 1,
    int PageSize = 12,
    string? Sort = "-UpdatedAtUtc" // "-UpdatedAtUtc", "-CreatedAtUtc"
);

public sealed record PagedResult<T>(IReadOnlyList<T> Items, int Total);
