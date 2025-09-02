namespace ChineseChess.Engine;

public class Board
{
    public const int Rows = 10;
    public const int Columns = 9;
    public Piece[,] Grid { get; private set; }
    public Player PlayerRed { get; private set; }
    public Player PlayerBlack { get; private set; }
    public Player CurrentPlayer { get; private set; }

    public Board()
    {
        Grid = new Piece[Rows, Columns];
        PlayerRed = new Player(Color.Red);
        PlayerBlack = new Player(Color.Black);
        CurrentPlayer = PlayerRed;

        InitializeEmptyBoard();
    }

    private void InitializeEmptyBoard()
    {
        for (int r = 0; r < Rows; r++)
        {
            for (int c = 0; c < Columns; c++)
            {
                Grid[r, c] = Piece.Empty; // Shared empty piece instance
            }
        }
    }

    public void InitializeLocalBoard()
    {
        // Red bottom side (rows 7–9)
        PlacePiece(9, 4, PieceType.General, PlayerRed);
        PlacePiece(9, 3, PieceType.Advisor, PlayerRed);
        PlacePiece(9, 5, PieceType.Advisor, PlayerRed);
        PlacePiece(9, 2, PieceType.Elephant, PlayerRed);
        PlacePiece(9, 6, PieceType.Elephant, PlayerRed);
        PlacePiece(9, 1, PieceType.Horse, PlayerRed);
        PlacePiece(9, 7, PieceType.Horse, PlayerRed);
        PlacePiece(9, 0, PieceType.Chariot, PlayerRed);
        PlacePiece(9, 8, PieceType.Chariot, PlayerRed);
        PlacePiece(7, 1, PieceType.Cannon, PlayerRed);
        PlacePiece(7, 7, PieceType.Cannon, PlayerRed);

        for (int col = 0; col < Columns; col += 2)
        {
            PlacePiece(6, col, PieceType.Soldier, PlayerRed);
        }

        // Black top side (rows 0–2)
        PlacePiece(0, 4, PieceType.General, PlayerBlack);
        PlacePiece(0, 3, PieceType.Advisor, PlayerBlack);
        PlacePiece(0, 5, PieceType.Advisor, PlayerBlack);
        PlacePiece(0, 2, PieceType.Elephant, PlayerBlack);
        PlacePiece(0, 6, PieceType.Elephant, PlayerBlack);
        PlacePiece(0, 1, PieceType.Horse, PlayerBlack);
        PlacePiece(0, 7, PieceType.Horse, PlayerBlack);
        PlacePiece(0, 0, PieceType.Chariot, PlayerBlack);
        PlacePiece(0, 8, PieceType.Chariot, PlayerBlack);
        PlacePiece(2, 1, PieceType.Cannon, PlayerBlack);
        PlacePiece(2, 7, PieceType.Cannon, PlayerBlack);

        for (int col = 0; col < Columns; col += 2)
        {
            PlacePiece(3, col, PieceType.Soldier, PlayerBlack);
        }
    }

    private void PlacePiece(int row, int col, PieceType type, Player player)
    {
        var piece = new Piece(player, type);
        Grid[row, col] = piece;
        player.AddPiece(row, col, piece);
    }

    public bool MovePiece(int fromRow, int fromCol, int toRow, int toCol)
    {
        // Validate bounds
        if (!IsWithinBounds(fromRow, fromCol) || !IsWithinBounds(toRow, toCol))
            return false;

        Piece movingPiece = Grid[fromRow, fromCol];

        // Check if there is a piece to move
        if (movingPiece == null || movingPiece.Type == PieceType.None)
            return false;

        // Identify source and destination players
        Player currentPlayer = movingPiece.Owner == PlayerRed ? PlayerRed : PlayerBlack;
        Player opponentPlayer = movingPiece.Owner == PlayerRed ? PlayerBlack : PlayerRed;

        // Capture logic: remove from opponent dictionary
        Piece targetPiece = Grid[toRow, toCol];
        if (targetPiece.Type != PieceType.None && targetPiece.Owner != movingPiece.Owner)
        {
            opponentPlayer.RemovePiece((toRow, toCol));
        }

        // Move piece on the board
        Grid[toRow, toCol] = movingPiece;
        Grid[fromRow, fromCol] = Piece.Empty; // Empty piece

        // Update player's piece tracking
        currentPlayer.MovePiece((fromRow, fromCol), (toRow, toCol));

        return true;
    }

    private bool IsWithinBounds(int row, int col)
    {
        return row >= 0 && row < Rows && col >= 0 && col < Columns;
    }

    public bool IsGameOver()
    {
        // If the current player is in check and has no legal moves to escape it, they are checkmated.
        if (IsInCheck(CurrentPlayer) && !HasAnyLegalMoves(CurrentPlayer))
            return true;

        return false;
    }

    public bool IsInCheck(Player player)
    {
        Player opponent = player == PlayerRed ? PlayerBlack : PlayerRed;

        // Find the general's position
        var generalPos = player.FindGeneral();
        if (generalPos == null)
            return false; // Should not happen in a normal game

        int genRow = generalPos.Value.row;
        int genCol = generalPos.Value.col;

        // Check if any opponent piece can capture the general
        foreach (var kvp in opponent.Pieces)
        {
            var (opRow, opCol) = kvp.Key;
            var piece = kvp.Value;

            if (CanMove(opRow, opCol, genRow, genCol))
            {
                return true;
            }
        }

        return false;
    }

    public bool CanMove(int fromRow, int fromCol, int toRow, int toCol)
    {

        Piece piece = Grid[fromRow, fromCol];

        // Can't move to the same square
        if (fromRow == toRow && fromCol == toCol)
            return false;

        // Check bounds
        if (!IsWithinBounds(toRow, toCol))
            return false;

        Piece target = Grid[toRow, toCol];

        // Cannot move to a position occupied by own piece
        if (target.Type != PieceType.None && target.Owner == piece.Owner)
            return false;

        int dr = toRow - fromRow;
        int dc = toCol - fromCol;
        int absDr = Math.Abs(dr);
        int absDc = Math.Abs(dc);

        bool isCapture = target.Type != PieceType.None && target.Owner != piece.Owner;

        switch (piece.Type)
        {
            case PieceType.General:
                // Standard move within palace
                bool inPalace = piece.Owner == PlayerRed
                    ? (toRow >= 7 && toRow <= 9 && toCol >= 3 && toCol <= 5)
                    : (toRow >= 0 && toRow <= 2 && toCol >= 3 && toCol <= 5);

                bool normalMove = (absDr == 1 && dc == 0) || (absDc == 1 && dr == 0);

                if (inPalace && normalMove)
                    return true;

                // "Flying General" capture: check if directly facing the other General with no pieces between
                if (fromCol == toCol)
                {
                    int step = piece.Owner == PlayerRed ? -1 : 1;
                    int checkRow = fromRow + step;

                    while (checkRow >= 0 && checkRow < Rows)
                    {
                        var midPiece = Grid[checkRow, fromCol];
                        if (midPiece.Type != PieceType.None)
                        {
                            if (midPiece.Type == PieceType.General && midPiece.Owner != piece.Owner)
                                return checkRow == toRow; // Must be landing directly on opponent General
                            else
                                break; // Blocked
                        }

                        checkRow += step;
                    }
                }
                return false;

            case PieceType.Advisor:
                if (piece.Owner == PlayerRed && (toRow < 7 || toCol < 3 || toCol > 5)) return false;
                if (piece.Owner == PlayerBlack && (toRow > 2 || toCol < 3 || toCol > 5)) return false;
                return absDr == 1 && absDc == 1;

            case PieceType.Elephant:
                if ((piece.Owner == PlayerRed && toRow < 5) || (piece.Owner == PlayerBlack && toRow > 4))
                    return false; // Can't cross river
                if (absDr == 2 && absDc == 2)
                {
                    int midRow = (fromRow + toRow) / 2;
                    int midCol = (fromCol + toCol) / 2;
                    return Grid[midRow, midCol].Type == PieceType.None; // "Elephant eye" is not blocked
                }
                return false;

            case PieceType.Horse:
                if (absDr == 2 && absDc == 1)
                {
                    int blockRow = fromRow + (dr / 2);
                    return Grid[blockRow, fromCol].Type == PieceType.None;
                }
                if (absDr == 1 && absDc == 2)
                {
                    int blockCol = fromCol + (dc / 2);
                    return Grid[fromRow, blockCol].Type == PieceType.None;
                }
                return false;

            case PieceType.Chariot:
                if (dr != 0 && dc != 0) return false;
                int stepR = dr == 0 ? 0 : dr / absDr;
                int stepC = dc == 0 ? 0 : dc / absDc;
                for (int i = 1; i < Math.Max(absDr, absDc); i++)
                {
                    int r = fromRow + stepR * i;
                    int c = fromCol + stepC * i;
                    if (Grid[r, c].Type != PieceType.None) return false;
                }
                return true;

            case PieceType.Cannon:
                if (dr != 0 && dc != 0) return false;
                int count = 0;
                int dRow = dr == 0 ? 0 : dr / absDr;
                int dCol = dc == 0 ? 0 : dc / absDc;
                for (int i = 1; i < Math.Max(absDr, absDc); i++)
                {
                    int r = fromRow + dRow * i;
                    int c = fromCol + dCol * i;
                    if (Grid[r, c].Type != PieceType.None) count++;
                }
                return (count == 0 && !isCapture) || (count == 1 && isCapture);

            case PieceType.Soldier:
                bool crossedRiver = (piece.Owner == PlayerRed && fromRow <= 4) ||
                                    (piece.Owner == PlayerBlack && fromRow >= 5);
                if (piece.Owner == PlayerRed)
                {
                    if (dr == -1 && dc == 0) return true;
                    if (crossedRiver && dr == 0 && absDc == 1) return true;
                }
                else
                {
                    if (dr == 1 && dc == 0) return true;
                    if (crossedRiver && dr == 0 && absDc == 1) return true;
                }
                return false;
        }

        return false;
    }

    public bool HasAnyLegalMoves(Player player)
    {
        foreach (var fromKvp in player.Pieces)
        {
            var fromPos = fromKvp.Key;
            var piece = fromKvp.Value;

            for (int toR = 0; toR < Rows; toR++)
            {
                for (int toC = 0; toC < Columns; toC++)
                {
                    if (!IsWithinBounds(toR, toC)) continue;
                    if ((fromPos.row == toR) && (fromPos.col == toC)) continue;

                    var targetPiece = Grid[toR, toC];

                    // Skip if the target is occupied by the same player's piece
                    if (targetPiece.Type != PieceType.None && targetPiece.Owner == player)
                        continue;

                    if (CanMove(fromPos.row, fromPos.col, toR, toC))
                    {
                        // Simulate move
                        var originalFrom = Grid[fromPos.row, fromPos.col];
                        var originalTo = Grid[toR, toC];

                        Grid[toR, toC] = originalFrom;
                        Grid[fromPos.row, fromPos.col] = Piece.Empty;

                        bool inCheck = IsInCheck(player);

                        // Undo move
                        Grid[fromPos.row, fromPos.col] = originalFrom;
                        Grid[toR, toC] = originalTo;

                        if (!inCheck)
                            return true;
                    }
                }
            }
        }

        return false;
    }

    public void PrintBoard()
    {
        ConsoleColor redColor = ConsoleColor.Red;
        ConsoleColor blackColor = ConsoleColor.DarkYellow;
        ConsoleColor borderColor = ConsoleColor.Cyan;

        string horizontalLabels = "    A   B   C   D   E   F   G   H   I";
        string horizontalBorder = "  +" + string.Join("", Enumerable.Repeat("---+", Columns));

        Console.ForegroundColor = borderColor;
        Console.WriteLine(horizontalLabels); // Top A–I
        Console.WriteLine(horizontalBorder);
        Console.ResetColor();

        for (int r = 0; r < Rows; r++)
        {
            Console.ForegroundColor = borderColor;
            Console.Write($"{(r + 1),2}|"); // Row number with padding
            Console.ResetColor();

            for (int c = 0; c < Columns; c++)
            {
                var piece = Grid[r, c];

                if (piece.Type == PieceType.None)
                {
                    Console.Write(" . "); // Empty spot
                }
                else
                {
                    Console.ForegroundColor = piece.Owner == PlayerRed ? redColor :
                                            piece.Owner == PlayerBlack ? blackColor : Console.ForegroundColor;

                    Console.Write($" {piece.ToString()} ");
                    Console.ResetColor();
                }

                Console.ForegroundColor = borderColor;
                Console.Write("|");
                Console.ResetColor();
            }

            Console.WriteLine();

            // Separator after each row
            Console.ForegroundColor = borderColor;
            Console.WriteLine(horizontalBorder);
            Console.ResetColor();

            // Optional: thicker line between red and black territory
            if (r == 4)
            {
                Console.ForegroundColor = borderColor;
                Console.WriteLine("   " + new string('=', Columns * 4)); // visual mid-line
                Console.ResetColor();
            }
        }

        Console.ForegroundColor = borderColor;
        Console.WriteLine(horizontalLabels); // Bottom A–I
        Console.ResetColor();
    }

    public void SwitchPlayer()
    {
        CurrentPlayer = CurrentPlayer == PlayerRed ? PlayerBlack : PlayerRed;
    }


}

