using ChineseChess.Engine;

namespace ChineseChess.Engine.Tests;

public class BoardBuilder
{
    private readonly Board _b;

    public BoardBuilder()
    {
        _b = new Board();
    }

    public BoardBuilder WithRed(PieceType type, int row, int col)
    {
        PlacePiece(row, col, type, _b.PlayerRed);
        return this;
    }

    public BoardBuilder WithBlack(PieceType type, int row, int col)
    {
        PlacePiece(row, col, type, _b.PlayerBlack);
        return this;
    }

    public BoardBuilder Empty(int row, int col)
    {
        _b.Grid[row, col] = Piece.Empty;
        _b.PlayerRed.RemovePiece((row, col));
        _b.PlayerBlack.RemovePiece((row, col));
        return this;
    }

    public Board Build() => _b;

    private void PlacePiece(int row, int col, PieceType type, Player player)
    {
        var piece = new Piece(player, type);
        _b.Grid[row, col] = piece;
        player.AddPiece(row, col, piece);
    }

}