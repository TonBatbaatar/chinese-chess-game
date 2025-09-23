using FluentAssertions;

namespace ChineseChess.Engine.Tests;

public class IsGameOverTests
{

    [Fact]
    public void BlackIsCheckmated_FlyingGeneralWithRooks_True()
    {
        var bb = new BoardBuilder();

        var board = bb
            .WithBlack(PieceType.General, 0, 4)
            .WithRed(PieceType.General, 9, 3)
            .WithRed(PieceType.Chariot, 9, 4)
            .WithRed(PieceType.Chariot, 9, 5)
            .Build();

        var isOver = board.IsGameOver(board.PlayerBlack);

        Assert.True(isOver);
    }


    [Fact]
    public void BlackHasEscape_WhenOneRookRemoved_False()
    {
        var bb = new BoardBuilder();

        var board = bb
            .WithBlack(PieceType.General, 0, 4)
            .WithRed(PieceType.General, 9, 3)
            .WithRed(PieceType.Chariot, 9, 4)
            .Build();

        var isOver = board.IsGameOver(board.PlayerBlack);

        Assert.False(isOver);
    }


    [Fact]
    public void BlackIsCheckmated_CannonThroughScreen_True()
    {
        var bb = new BoardBuilder();

        var board = bb
            .WithBlack(PieceType.General, 0, 4)
            .WithRed(PieceType.Soldier, 1, 4) // screen for the cannon
            .WithRed(PieceType.Cannon, 3, 4) // checking cannon
            .WithRed(PieceType.Chariot, 1, 3) // seal (0,3)
            .WithRed(PieceType.Chariot, 1, 5) // seal (0,5)
            .WithRed(PieceType.General, 9, 4) // covers (1,4) so Black can't step down
            .Build();

        var isOver = board.IsGameOver(board.PlayerBlack);

        Assert.True(isOver);
    }


    [Fact]
    public void BlackHasEscape_CannonThroughScreen_True()
    {
        var bb = new BoardBuilder();

        var board = bb
            .WithBlack(PieceType.General, 0, 4)
            .WithRed(PieceType.Soldier, 1, 4) // screen for the cannon
            .WithRed(PieceType.Cannon, 3, 4) // checking cannon
            .WithRed(PieceType.Chariot, 9, 3) // seal (0,3)
            .WithRed(PieceType.Chariot, 9, 5) // seal (0,5)
            .WithRed(PieceType.General, 9, 4) // covers (1,4) so Black can't step down
            .Build();

        var isOver = board.IsGameOver(board.PlayerBlack);

        Assert.False(isOver);
    }

}