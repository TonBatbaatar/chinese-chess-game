namespace ChineseChess
{
    public enum PieceType
    {
        None,
        General,
        Advisor,
        Elephant,
        Horse,
        Chariot,
        Cannon,
        Soldier
    }

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

        public override string ToString()
        {
            if (Type == PieceType.None)
                return ".";
            // For simplicity, use first letter of player + piece type initial
            var pieceChar = Type switch
            {
                PieceType.General => "G",
                PieceType.Advisor => "A",
                PieceType.Elephant => "E",
                PieceType.Horse => "H",
                PieceType.Chariot => "C",
                PieceType.Cannon => "N",
                PieceType.Soldier => "S",
                _ => "?"
            };
            return pieceChar;
        }
    }
}