import React from "react";
import type { Coord } from "./Board";

export type Ply = { from: Coord; to: Coord; piece: string };

const MoveList: React.FC<{ moves: Ply[] }> = ({ moves }) => (
  <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
    <div className="mb-2 text-sm font-semibold">Moves</div>
    <ol className="max-h-72 space-y-1 overflow-auto pr-2 text-xs text-slate-300">
      {moves.length === 0 && <li className="text-slate-500">No moves yet.</li>}
      {moves.map((m, i) => (
        <li key={i} className="flex items-center justify-between rounded-lg px-2 py-1 hover:bg-slate-800/60">
          <span>#{i + 1}</span>
          <span className="font-mono text-slate-200">{algebra(m.from)}→{algebra(m.to)}</span>
          <span className="text-slate-400">{m.piece}</span>
        </li>
      ))}
    </ol>
  </div>
);


export default MoveList;


function algebra(c: Coord): string {
  const files = "abcdefghi"; // x 0..8 -> a..i
  return `${files[c.x]}${10 - c.y}`;
}