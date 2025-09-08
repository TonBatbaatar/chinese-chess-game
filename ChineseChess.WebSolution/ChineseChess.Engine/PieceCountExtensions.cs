using System;
using System.Collections.Generic;

namespace ChineseChess.Engine;

internal static class PieceCountExtensions
{
    public static int Get(this IDictionary<PieceType, int> map, PieceType t)
    {
        return map != null && map.TryGetValue(t, out var v) ? v : 0;
    }

    public static int SumExcept(this IDictionary<PieceType, int> map, params PieceType[] except)
    {
        if (map == null) return 0;
        var ex = new HashSet<PieceType>(except ?? Array.Empty<PieceType>());
        int sum = 0;
        foreach (var kvp in map)
        {
            if (!ex.Contains(kvp.Key)) sum += kvp.Value;
        }
        return sum;
    }


}