namespace ChineseChess.Engine;

public class Piece
{
    public PieceType Type { get; set; }
    public Player? Owner { get; set; }

    // Singleton empty piece instance
    public static readonly Piece Empty = new Piece(null, PieceType.None);

    public Piece(Player? owner, PieceType type = PieceType.None)
    {
        if (type != PieceType.None && owner == null)
            throw new ArgumentException("Non-empty pieces must have an owner.");

        Owner = owner;
        Type = type;
    }
}
