using ChineseChess.Engine;

namespace ChineseChess.Api.Game;

public class GameSession
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public Board Board { get; init; }
    public string CurrentTurn => Board.CurrentPlayer.Color.ToString();
    public List<string> Moves { get; } = new(); // store simple text like "A3-B3" for now

    public GameSession(Board board) => Board = board;
}