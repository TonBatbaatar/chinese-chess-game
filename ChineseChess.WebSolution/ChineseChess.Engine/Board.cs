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
        PlayerRed = new Player(Color.Red, true);
        PlayerBlack = new Player(Color.Black, false);
        CurrentPlayer = PlayerRed;

        InitializeEmptyBoard();
    }

    /// <summary>
    /// not used yet!!!!!!!!!!!!!!!!!!
    /// </summary>
    /// <returns></returns>
    public bool IsGameOver(Player player)
    {

        // If the current player is in check and has no legal moves to escape it, they are checkmated.
        if (IsInCheck(player) && !HasAnyLegalMoves(player))
            return true;

        return false;
    }


    /// <summary>
    /// get player by its conneciton ID
    /// </summary>
    /// <param name="connectionID"> the key to find the player in this board</param>
    /// <returns>return the player object from the board</returns>
    public Player GetPlayerByID(string connectionID)
    {
        if (PlayerRed.PlayerConnectionID == connectionID) return PlayerRed;
        else return PlayerBlack;
    }

    public Player GetOppnentPlayer(string connectionID)
    {
        if (PlayerRed.PlayerConnectionID == connectionID) return PlayerBlack;
        else return PlayerRed;
    }

    /// <summary>
    /// not used yet!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    /// </summary>
    /// <param name="player"></param>
    /// <returns></returns>
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

    /// <summary>
    /// not used yet!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    /// Detects draw conditions per common Chinese Chess rules. This method handles:
    /// 1) Theoretical/insufficient-material draws based on current material only.
    /// 2) Threefold/cyclic repetition (via caller-provided count).
    /// 3) Perpetual check or capture flags (caller-provided).
    /// 4) 60-move natural limit (via caller-provided halfmove count since last capture or pawn move).
    ///
    /// Notes:
    /// - For repetition/perpetual/60-move rules, pass your tracked values from the game loop.
    ///   * noProgressHalfMoves: half-move clock since the last capture or pawn (bing/zu) move.
    ///   * repetitionCount: how many times the current position (including side-to-move) has occurred.
    ///   * perpetualCheckDetected / perpetualCaptureDetected: set these based on your repetition detection logic.
    /// - Pure "trapped with no moves" stalemate is NOT auto-declared a draw here because it’s nuanced in Xiangqi;
    ///   your game-end logic (win/loss/draw) should decide using IsInCheck + HasAnyLegalMoves if you adopt special exceptions.
    /// </summary>
    public bool IsDraw(out string reason, int noProgressHalfMoves = 0, int repetitionCount = 1, bool perpetualCheckDetected = false, bool perpetualCaptureDetected = false)
    {
        // -------- 1) Theoretical / Insufficient-material draws (current board only) --------
        if (IsTheoreticalDraw(out reason))
            return true;

        // -------- 2) Repetition / Cycles --------
        // Many competitions treat threefold (or more) repetition/cycles without winning chances as a draw.
        // If you differentiate forced-win vs no-win cycles, gate this with your own flag; here we accept >=3 as draw.
        if (repetitionCount >= 3)
        {
            reason = "Draw by cyclic repetition (≥3 occurrences of the same position).";
            return true;
        }

        // -------- 3) Perpetual check / capture (forbidden one-sided loops) --------
        if (perpetualCheckDetected)
        {
            reason = "Draw by perpetual checking (continuous checking loop).";
            return true;
        }
        if (perpetualCaptureDetected)
        {
            reason = "Draw by perpetual capture/harassment (continuous capture loop).";
            return true;
        }

        // -------- 4) 60-move natural limit (no capture and no pawn move) --------
        // 60 full moves = 120 half-moves.
        if (noProgressHalfMoves >= 120)
        {
            reason = "Draw by 60-move rule (no capture and no pawn move in 60 moves).";
            return true;
        }

        // -------- 5) Default: not a draw --------
        reason = string.Empty;
        return false;
    }

    /// <summary>
    /// initialize board with pieces with initial position
    /// </summary>
    public void InitializeBoard()
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


    /// <summary>
    /// moving a piece from source cordinate to destination cordinate, have to use validation method before calling this method, valiadation method is CanMove
    /// </summary>
    /// <param name="fromRow">source row number</param>
    /// <param name="fromCol">source column number</param>
    /// <param name="toRow">destination row number</param>
    /// <param name="toCol">destination column number</param>
    /// <returns></returns>
    public bool MovePiece(int fromRow, int fromCol, int toRow, int toCol)
    {
        Piece movingPiece = Grid[fromRow, fromCol];

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


    /// <summary>
    /// check if the piece is allowed to move by rule, Chinese chess rule is applied in this method
    /// </summary>
    /// <param name="fromRow">piece source row number</param>
    /// <param name="fromCol">piece source column number</param>
    /// <param name="toRow">piece destination column number</param>
    /// <param name="toCol">piece destination column number</param>
    /// <returns>true when the move is allowed</returns>
    public bool CanMove(int fromRow, int fromCol, int toRow, int toCol)
    {
        // 1. Validate bounds
        if (!IsWithinBounds(fromRow, fromCol) || !IsWithinBounds(toRow, toCol))
            return false;

        Piece piece = Grid[fromRow, fromCol];

        // 2. Check if there is a piece to move
        if (piece == null || piece.Type == PieceType.None)
            return false;

        // 3. Can't move to the same square
        if (fromRow == toRow && fromCol == toCol)
            return false;

        Piece target = Grid[toRow, toCol];

        // 4. Cannot move to a position occupied by own piece
        if (target.Type != PieceType.None && target.Owner == piece.Owner)
            return false;

        int dr = toRow - fromRow;
        int dc = toCol - fromCol;
        int absDr = Math.Abs(dr);
        int absDc = Math.Abs(dc);

        bool isCapture = target.Type != PieceType.None && target.Owner != piece.Owner;

        // 5. Specific piece rule by Chinese Chess
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

    /// <summary>
    /// reassign current player variable to other player
    /// </summary>
    public void SwitchPlayer()
    {
        CurrentPlayer = CurrentPlayer == PlayerRed ? PlayerBlack : PlayerRed;
        PlayerRed.switchTurn();
        PlayerBlack.switchTurn();
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

    public bool HasAnyLegalMoves(Player player)
    {
        // snapshot of the player’s pieces at their current squares
        var fromEntries = player.Pieces.ToList(); // List<KeyValuePair<(int row,int col), Piece>>

        foreach (var fromKvp in fromEntries)
        {
            var fromPos = fromKvp.Key;
            var piece = fromKvp.Value;

            // The piece may have moved/captured since snapshot (in multithreaded cases),
            // skip if it’s no longer there.
            if (!ReferenceEquals(Grid[fromPos.row, fromPos.col], piece))
                continue;

            for (int toR = 0; toR < Rows; toR++)
            {
                for (int toC = 0; toC < Columns; toC++)
                {
                    if ((fromPos.row == toR) && (fromPos.col == toC)) continue;

                    var targetPiece = Grid[toR, toC];

                    // Skip if the target is occupied by the same player's piece
                    if (targetPiece.Type != PieceType.None && targetPiece.Owner == player)
                        continue;

                    if (!CanMove(fromPos.row, fromPos.col, toR, toC))
                        continue;

                    if (SimulateMove(fromPos.row, fromPos.col, toR, toC, out var sim))
                    {
                        bool inCheck = IsInCheck(player);
                        RevertSim(sim);

                        if (!inCheck)
                            return true;
                    }
                }
            }
        }

        return false;
    }

    private bool IsWithinBounds(int row, int col)
    {
        return row >= 0 && row < Rows && col >= 0 && col < Columns;
    }

    private void PlacePiece(int row, int col, PieceType type, Player player)
    {
        var piece = new Piece(player, type);
        Grid[row, col] = piece;
        player.AddPiece(row, col, piece);
    }

    private Dictionary<PieceType, int> CountPieces(Player player)
    {
        var counts = new Dictionary<PieceType, int>();
        foreach (var kvp in player.Pieces)
        {
            var p = kvp.Value;
            if (p.Type == PieceType.None) continue;
            if (!counts.ContainsKey(p.Type)) counts[p.Type] = 0;
            counts[p.Type]++;
        }
        return counts;
    }

    // Helper predicates for draw detection
    private bool OnlyKing(IDictionary<PieceType, int> c)
    {
        return c.Get(PieceType.General) == 1 && c.SumExcept(PieceType.General) == 0;
    }


    private bool OnlyKingShiXiang(IDictionary<PieceType, int> c)
    {
        return c.Get(PieceType.General) == 1 &&
            c.SumExcept(PieceType.General, PieceType.Advisor, PieceType.Elephant) == 0;
    }

    private bool IsTheoreticalDraw(out string why)
    {
        // Gather piece counts for both sides.
        var redCounts = CountPieces(PlayerRed);
        var blackCounts = CountPieces(PlayerBlack);

        // 1) King vs King
        if (OnlyKing(redCounts) && OnlyKing(blackCounts))
        {
            why = "Theoretical draw: king vs king.";
            return true;
        }

        // 2) King+(shi/xiang only) vs King+(shi/xiang only)
        if (OnlyKingShiXiang(redCounts) && OnlyKingShiXiang(blackCounts))
        {
            why = "Theoretical draw: both sides have only king with advisors/elephants.";
            return true;
        }

        // 3) Single cannon edge case: if across the entire board there is at most one cannon
        //    and no rooks/horses/pawns remain, neither side can realistically mate.
        int totalCannons = redCounts.Get(PieceType.Cannon) + blackCounts.Get(PieceType.Cannon);
        bool noHeavyOrPawns =
            redCounts.Get(PieceType.Chariot) + blackCounts.Get(PieceType.Chariot) == 0 &&
            redCounts.Get(PieceType.Horse) + blackCounts.Get(PieceType.Horse) == 0 &&
            redCounts.Get(PieceType.Soldier) + blackCounts.Get(PieceType.Soldier) == 0;

        if (totalCannons <= 1 && noHeavyOrPawns)
        {
            why = "Theoretical draw: no mating material (no rooks/horses/pawns and ≤1 cannon).";
            return true;
        }

        // 4) One side has only king+(shi/xiang only), the other has only king+cannon (no other pieces).
        //    Without a screen piece, cannon cannot force mate against a fortified palace.
        bool sideA_KingShiXiangOnly = OnlyKingShiXiang(redCounts);
        bool sideB_OnlyKingAndOneCannon = blackCounts.Get(PieceType.General) == 1 &&
                                        blackCounts.Get(PieceType.Cannon) == 1 &&
                                        blackCounts.SumExcept(PieceType.General, PieceType.Cannon) == 0;
        bool sideB_KingShiXiangOnly = OnlyKingShiXiang(blackCounts);
        bool sideA_OnlyKingAndOneCannon = redCounts.Get(PieceType.General) == 1 &&
                                        redCounts.Get(PieceType.Cannon) == 1 &&
                                        redCounts.SumExcept(PieceType.General, PieceType.Cannon) == 0;

        if ((sideA_KingShiXiangOnly && sideB_OnlyKingAndOneCannon) ||
            (sideB_KingShiXiangOnly && sideA_OnlyKingAndOneCannon))
        {
            // Double-check there is no screen piece on board at all (already implied by counts above).
            why = "Theoretical draw: cannon without screen vs king with advisors/elephants.";
            return true;
        }

        // Otherwise, assume mating chances still exist.
        why = string.Empty;
        return false;
    }


    public sealed class Sim // record the exact changes to undo later
    {
        public required (int r, int c) From;
        public required (int r, int c) To;
        public required Piece Moved;
        public Piece? Captured;
        public Player? CapturedOwner;
    }

    public bool SimulateMove(int fromR, int fromC, int toR, int toC, out Sim sim)
    {
        sim = new Sim
        {
            From = (fromR, fromC),
            To = (toR, toC),
            Moved = Grid[fromR, fromC],
            Captured = Grid[toR, toC].Type == PieceType.None ? null : Grid[toR, toC],
            CapturedOwner = Grid[toR, toC].Type == PieceType.None ? null : Grid[toR, toC].Owner
        };

        var moved = sim.Moved;
        if (moved == null || moved.Type == PieceType.None)
            return false;

        // 1) Remove captured from board + opponent dictionary
        if (sim.Captured != null && sim.CapturedOwner != null)
        {
            sim.CapturedOwner.Pieces.Remove((toR, toC));
        }

        // 2) Move the piece on the board
        Grid[toR, toC] = moved;
        Grid[fromR, fromC] = Piece.Empty; // however you represent empty

        // 3) Update the mover’s dictionary key
        if (moved.Owner == null) return false;
        var owner = moved.Owner;
        owner.Pieces.Remove((fromR, fromC));
        owner.Pieces[(toR, toC)] = moved;

        return true;
    }

    public void RevertSim(Sim sim)
    {
        var moved = sim.Moved;

        // 1) Move the piece back on the board
        Grid[sim.From.r, sim.From.c] = moved;
        Grid[sim.To.r, sim.To.c] = sim.Captured ?? Piece.Empty;

        // 2) Restore mover’s dictionary position
        if (moved.Owner == null) return;
        var owner = moved.Owner;
        owner.Pieces.Remove(sim.To);
        owner.Pieces[sim.From] = moved;

        // 3) Restore captured piece (if any)
        if (sim.Captured != null && sim.CapturedOwner != null)
        {
            sim.CapturedOwner.Pieces[sim.To] = sim.Captured;
        }
    }

}