using System.ComponentModel.DataAnnotations;

namespace ChineseChess.Api.Data;

public class GameRecord
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    // JSON snapshot of the board (BoardDto)
    [Required]
    public string StateJson { get; set; } = "{}";

    // JSON array of moves, e.g. ["A10-A9","B3-C3", ...]
    [Required]
    public string MovesJson { get; set; } = "[]";

    // Who created the room / owns it (nullable for guests)
    public string? CreatorUserId { get; set; }

    // bind player with the game record
    public string? RedUserId { get; set; }
    public string? BlackUserId { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;

    public bool IsFinished { get; set; } = false;

    public TimeSpan Initial { get; set; }
    public TimeSpan Increment { get; set; }
    public string? Result { get; set; } // "1-0" "0-1" "1/2-1/2"
}