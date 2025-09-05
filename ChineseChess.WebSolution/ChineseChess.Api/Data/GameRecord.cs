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

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;

    public bool IsFinished { get; set; } = false;
}