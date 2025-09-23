using ChineseChess.Engine;

namespace ChineseChess.Api.Game;

public class GameSession
{

    // variables
    public Guid Id { get; init; } = Guid.NewGuid();
    public Board Board { get; init; }
    public List<string> Moves { get; } = new(); // store simple text like "A3-B3" for now
    public GameClock Clock { get; private set; }


    /// <summary>
    /// constructor
    /// </summary>
    /// <param name="board"></param>
    public GameSession(Board board, TimeControl tc)
    {
        Board = board;
        Clock = new GameClock(tc);
    }

}