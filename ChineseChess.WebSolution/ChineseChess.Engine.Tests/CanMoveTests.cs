using ChineseChess.Engine;
using FluentAssertions;
using Xunit;

namespace ChineseChess.Engine.Tests;

public class CanMoveTests
{
    [Fact]
    public void Cannot_Move_OffBoard_Or_SameSquare()
    {
        var b = new BoardBuilder()
            .WithRed(PieceType.Soldier, 5, 4) // row 5, col 4
            .Build();

        b.CanMove(5, 4, 5, 4).Should().BeFalse(); // same square
        b.CanMove(5, 4, -1, 4).Should().BeFalse(); // off board
        b.CanMove(5, 4, 10, 4).Should().BeFalse();
        b.CanMove(5, 4, 5, -1).Should().BeFalse();
        b.CanMove(5, 4, 5, 9).Should().BeFalse();
    }

    [Fact]
    public void Cannot_Capture_OwnPiece()
    {
        var b = new BoardBuilder()
            .WithRed(PieceType.Chariot, 9, 0)
            .WithRed(PieceType.Soldier, 8, 0)
            .Build();

        b.CanMove(9, 0, 8, 0).Should().BeFalse();
    }

    // // General
    [Fact]
    public void General_Only_InsidePalace_And_OneStep_Orthogonal()
    {
        var b = new BoardBuilder()
            .WithRed(PieceType.General, 9, 4)
            .Build();

        b.CanMove(9, 4, 8, 4).Should().BeTrue(); // forward in palace
        b.CanMove(9, 4, 9, 3).Should().BeTrue(); // left in palace
        b.CanMove(9, 4, 7, 4).Should().BeFalse(); // too far
        b.CanMove(9, 4, 9, 6).Should().BeFalse(); // out of palace col
    }

    [Fact]
    public void FlyingGeneral_Capture_If_ClearFile()
    {
        var b = new BoardBuilder()
            .WithRed(PieceType.General, 9, 4)
            .WithBlack(PieceType.General, 0, 4)
            .Build();

        b.CanMove(9, 4, 0, 4).Should().BeTrue(); // clear file

        var b2 = new BoardBuilder()
        .WithRed(PieceType.General, 9, 4)
        .WithBlack(PieceType.General, 0, 4)
        .WithRed(PieceType.Soldier, 5, 4)
        .Build();

        b2.CanMove(9, 4, 0, 4).Should().BeFalse();
    }

    // // Advisor
    [Fact]
    public void Advisor_Diagonal_InPalace()
    {
        var b = new BoardBuilder()
            .WithRed(PieceType.Advisor, 9, 3)
            .Build();

        b.CanMove(9, 3, 8, 4).Should().BeTrue(); // diagonal inside palace
        b.CanMove(9, 3, 8, 3).Should().BeFalse(); // straight
        b.CanMove(9, 3, 7, 5).Should().BeFalse(); // too far
    }

    // Elephant
    [Fact]
    public void Elephant_TwoSteps_Diagonal_NoEyeBlock_NoRiverCross()
    {
        var b1 = new BoardBuilder()
            .WithRed(PieceType.Elephant, 9, 2)
            .Build();

        b1.CanMove(9, 2, 7, 4).Should().BeTrue(); // valid

        var b2 = new BoardBuilder()
            .WithRed(PieceType.Elephant, 9, 2)
            .WithRed(PieceType.Soldier, 8, 3) // eye block
            .Build();

        b2.CanMove(9, 2, 7, 4).Should().BeFalse(); // eye blocked

        var b3 = new BoardBuilder()
            .WithRed(PieceType.Elephant, 9, 2)
            .Build();

        b3.CanMove(9, 2, 5, 6).Should().BeFalse(); // crosses river
    }

    // Horse
    [Fact]
    public void Horse_LegBlock_Rule()
    {
        // L-shape allowed when leg is clear
        var clear = new BoardBuilder()
            .WithRed(PieceType.Horse, 9, 1)
            .Build();
        clear.CanMove(9, 1, 7, 2).Should().BeTrue();

        // Leg blocked at (8,1)
        var blocked = new BoardBuilder()
            .WithRed(PieceType.Horse, 9, 1)
            .WithRed(PieceType.Soldier, 8, 1)
            .Build();
        blocked.CanMove(9, 1, 7, 2).Should().BeFalse();
    }

    // Chariot
    [Fact]
    public void Chariot_ClearPath_Orthogonal()
    {
        // Clear path
        var clear = new BoardBuilder()
            .WithRed(PieceType.Chariot, 9, 0)
            .Build();
        clear.CanMove(9, 0, 5, 0).Should().BeTrue();

        // Blocked at (7,0)
        var blocked = new BoardBuilder()
            .WithRed(PieceType.Chariot, 9, 0)
            .WithRed(PieceType.Soldier, 7, 0)
            .Build();
        blocked.CanMove(9, 0, 5, 0).Should().BeFalse();
    }

    // Cannon
    [Fact]
    public void Cannon_ZeroScreenForMove_OneScreenForCapture()
    {
        // Move vertically with no screen
        var moveNoScreen = new BoardBuilder()
            .WithRed(PieceType.Cannon, 7, 1)
            .Build();
        moveNoScreen.CanMove(7, 1, 5, 1).Should().BeTrue();

        // Attempt capture with no screen in between (should fail)
        var captureNoScreen = new BoardBuilder()
            .WithRed(PieceType.Cannon, 7, 1)
            .WithBlack(PieceType.Soldier, 2, 1)
            .Build();
        captureNoScreen.CanMove(7, 1, 2, 1).Should().BeFalse();

        // Capture with exactly one screen in between (should pass)
        var captureOneScreen = new BoardBuilder()
            .WithRed(PieceType.Cannon, 7, 1)
            .WithRed(PieceType.Soldier, 5, 1)   // screen
            .WithBlack(PieceType.Soldier, 2, 1) // target
            .Build();
        captureOneScreen.CanMove(7, 1, 2, 1).Should().BeTrue();

        // Two screens in between (should fail)
        var captureTwoScreens = new BoardBuilder()
            .WithRed(PieceType.Cannon, 7, 1)
            .WithRed(PieceType.Soldier, 5, 1)   // screen 1
            .WithRed(PieceType.Soldier, 4, 1)   // screen 2
            .WithBlack(PieceType.Soldier, 2, 1) // target
            .Build();
        captureTwoScreens.CanMove(7, 1, 2, 1).Should().BeFalse();
    }

    // Soldier
    [Fact]
    public void Red_Soldier_ForwardOnly_BeforeRiver()
    {
        var b = new BoardBuilder()
            .WithRed(PieceType.Soldier, 6, 4) // row 6 above river
            .Build();

        b.CanMove(6, 4, 5, 4).Should().BeTrue();  // forward
        b.CanMove(6, 4, 6, 3).Should().BeFalse(); // sideways before river
        b.CanMove(6, 4, 7, 4).Should().BeFalse(); // backward
    }

    [Fact]
    public void Red_Soldier_CanGoSideways_AfterRiver()
    {
        var b = new BoardBuilder()
            .WithRed(PieceType.Soldier, 4, 4) // crossed river
            .Build();

        b.CanMove(4, 4, 3, 4).Should().BeTrue(); // forward
        b.CanMove(4, 4, 4, 3).Should().BeTrue(); // sideways
        b.CanMove(4, 4, 5, 4).Should().BeFalse(); // backward
    }

    [Fact]
    public void Black_Soldier_MirrorLogic()
    {
        var b = new BoardBuilder()
            .WithBlack(PieceType.Soldier, 3, 4) // before crossing river
            .Build();

        b.CanMove(3, 4, 4, 4).Should().BeTrue();  // forward (down)
        b.CanMove(3, 4, 3, 3).Should().BeFalse(); // sideways before river
        b.CanMove(3, 4, 2, 4).Should().BeFalse(); // backward
    }
}
