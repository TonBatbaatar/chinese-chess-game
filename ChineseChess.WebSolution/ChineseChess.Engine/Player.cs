using System;
using System.Collections.Generic;
using System.Threading.Tasks.Dataflow;

namespace ChineseChess.Engine;

public class Player
{
    public Color Color { get; set; }
    public string? PlayerID { get; set; }
    public string? PlayerConnectionID { get; set; }
    public string? PlayerEmail { get; set; }
    public bool IsMyTurn { get; set; }
    public TimeSpan RemainingTime { get; set; }

    // For the disconnect grace window
    public CancellationTokenSource? ForfeitCts { get; set; }
    public DateTimeOffset? DisconnectDeadlineUtc { get; set; }
    public bool IsConnected { get; set; }

    // Key = position, Value = piece at that position
    public Dictionary<(int row, int col), Piece> Pieces { get; private set; }

    // constructor
    public Player(Color color, bool isMyTurn)
    {
        Color = color;
        this.IsMyTurn = isMyTurn;
        Pieces = new Dictionary<(int row, int col), Piece>();
    }

    /// <summary>
    /// switch the player turn
    /// </summary>
    public void switchTurn()
    {
        if (IsMyTurn == true)
        {
            IsMyTurn = false;
        }
        else
        {
            IsMyTurn = true;
        }

    }

    public void AddPiece(int row, int col, Piece piece)
    {
        Pieces[(row, col)] = piece;
    }

    public void MovePiece((int row, int col) from, (int row, int col) to)
    {
        if (!Pieces.ContainsKey(from)) return;

        var piece = Pieces[from];
        Pieces.Remove(from);
        Pieces[to] = piece;
    }

    public void RemovePiece((int row, int col) pos)
    {
        Pieces.Remove(pos);
    }

    public (int row, int col)? FindGeneral()
    {
        foreach (var kvp in Pieces)
        {
            if (kvp.Value.Type == PieceType.General)
                return kvp.Key;
        }

        return null;
    }
}
