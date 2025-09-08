using ChineseChess.Engine;

namespace ChineseChess.Api.Mapping;

public static class BoardMapper
{
    public static object ToDto(Board board)
    {
        var rows = Board.Rows;      // or board.Rows
        var cols = Board.Columns;   // or board.Columns

        var cells = new List<object>(rows * cols);
        for (int r = 0; r < rows; r++)
            for (int c = 0; c < cols; c++)
            {
                var p = board.Grid[r, c];
                cells.Add(new
                {
                    r,
                    c,
                    type = p.Type.ToString(),     // e.g., "General"
                    owner = p.Owner == null ? "None" : p.Owner.Color.ToString() // "Red"/"Black"/"None"
                });
            }

        return new
        {
            rows,
            cols,
            cells,
            currentPlayer = board.CurrentPlayer.Color.ToString()
        };
    }
}
