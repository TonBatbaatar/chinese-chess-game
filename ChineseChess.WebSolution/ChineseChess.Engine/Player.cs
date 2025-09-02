using System;
using System.Collections.Generic;

namespace ChineseChess.Engine
{

    public enum Color
    {
        None,
        Red,
        Black
    }


    public class Player
    {
        public Color Color { get; set; }

        // Key = position, Value = piece at that position
        public Dictionary<(int row, int col), Piece> Pieces { get; private set; }

        public Player(Color color)
        {
            Color = color;
            Pieces = new Dictionary<(int row, int col), Piece>();
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
}