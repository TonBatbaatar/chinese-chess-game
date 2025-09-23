using FluentAssertions;

namespace ChineseChess.Engine.Tests;

public class IsInCheckTest
{
    [Fact]
    public void BlackInCheck_RedRookSameFile_NoBlock_True()
    {
        var bb = new BoardBuilder();

        var board = bb
            .WithBlack(PieceType.General, 0, 3)   // Black General at top center
            .WithRed(PieceType.Chariot, 1, 3)     // Red Rook below on same file, no blockers
            .Build();

        Assert.True(board.IsInCheck(board.PlayerBlack));
        Assert.False(board.IsInCheck(board.PlayerRed)); // sanity
    }
}