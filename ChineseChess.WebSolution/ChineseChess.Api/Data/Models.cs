using System.ComponentModel.DataAnnotations;

namespace ChineseChess.Api.Data;

public class Match
{
    public int Id { get; set; }
    [Required] public string PlayerRedId { get; set; } = "";
    [Required] public string PlayerBlackId { get; set; } = "";
    [Required] public string MovesJson { get; set; } = "[]";
    [Required] public string Result { get; set; } = "";
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? EndedAt { get; set; }
}

public class SavedGame
{
    public int Id { get; set; }
    [Required] public string PlayerRedId { get; set; } = "";
    [Required] public string PlayerBlackId { get; set; } = "";
    [Required] public string GameStateJson { get; set; } = "";
    public DateTime SavedAt { get; set; } = DateTime.UtcNow;
    public bool IsFinished { get; set; }
}
