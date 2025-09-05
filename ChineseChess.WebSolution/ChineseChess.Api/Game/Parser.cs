namespace ChineseChess.Api.Game;

public class Parser
{
    public static bool TryParseCoordinate(string coord, out (int row, int col) pos)
    {
        pos = (-1, -1);
        coord = coord.Trim().ToUpper();

        if (coord.Length < 2 || coord.Length > 3) return false;

        char colChar = coord[0];
        if (colChar < 'A' || colChar > 'I') return false;

        if (!int.TryParse(coord[1..], out int rowNum)) return false;
        if (rowNum < 1 || rowNum > 10) return false;

        int col = colChar - 'A';
        int row = rowNum - 1;
        pos = (row, col);
        return true;
    }
}

