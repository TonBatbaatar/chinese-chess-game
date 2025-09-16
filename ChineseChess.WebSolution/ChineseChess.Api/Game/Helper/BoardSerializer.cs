using System.Text.Json;
using ChineseChess.Engine;

namespace ChineseChess.Api.Game;

public class BoardSerializer
{
    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    };

    // DTO shape that matches what already send to the client
    public class BoardDto
    {
        public int Rows { get; set; }
        public int Cols { get; set; }
        public string CurrentPlayer { get; set; } = "Red";
        public List<CellDto> Cells { get; set; } = new();
    }

    public class CellDto
    {
        public int R { get; set; }
        public int C { get; set; }
        public string Type { get; set; } = "None";
        public string Owner { get; set; } = "None";
    }

    public string ToJson(Board board)
    {
        var dto = ToDto(board);
        return JsonSerializer.Serialize(dto, JsonOpts);
    }

    public BoardDto ToDto(Board board)
    {
        var rows = Board.Rows;
        var cols = Board.Columns;
        var cells = new List<CellDto>(rows * cols);

        for (int r = 0; r < rows; r++)
            for (int c = 0; c < cols; c++)
            {
                var p = board.Grid[r, c];
                cells.Add(new CellDto
                {
                    R = r,
                    C = c,
                    Type = p.Type.ToString(),
                    Owner = p.Owner == null ? "None" : p.Owner.Color.ToString()
                });
            }

        return new BoardDto
        {
            Rows = rows,
            Cols = cols,
            CurrentPlayer = board.CurrentPlayer.Color.ToString(),
            Cells = cells
        };
    }

    // Rehydrate engine Board from JSON snapshot
    public Board FromJson(string json)
    {
        var dto = JsonSerializer.Deserialize<BoardDto>(json, JsonOpts)
                  ?? throw new InvalidOperationException("Invalid board JSON");

        var board = new Board();
        // IMPORTANT: initialize empty first
        // (constructor/init creates an empty grid with Piece.Empty)
        // Now place pieces according to DTO:
        foreach (var cell in dto.Cells)
        {
            if (cell.Type == "None") continue;

            var owner = cell.Owner == "Red" ? Color.Red :
                        cell.Owner == "Black" ? Color.Black : Color.None;

            // You already have a PlacePiece(row,col,type,player) helper
            var type = Enum.Parse<PieceType>(cell.Type);
            var player = owner == Color.Red ? board.PlayerRed : board.PlayerBlack;

            // Reset cell if needed
            board.Grid[cell.R, cell.C] = Piece.Empty;
            // Place
            var piece = new Piece(player, type);
            board.Grid[cell.R, cell.C] = piece;
            player.AddPiece(cell.R, cell.C, piece);
        }

        // Fix current player if needed
        if (board.CurrentPlayer.Color.ToString() != dto.CurrentPlayer) board.SwitchPlayer();
        return board;
    }
}
