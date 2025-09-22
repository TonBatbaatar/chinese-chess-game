import React from "react";

export type Coord = { x: number; y: number }; // x:0..8, y:0..9

export type BoardProps = {
  board: string[][]; // 10x9 matrix; "rR" red rook, "bK" black king, "" empty
  selected: Coord | null;
  legalTargets: Coord[];
  sideToMove: "Red" | "Black";
  onSquareClick: (x: number, y: number) => void;
};

const Board: React.FC<BoardProps> = ({ board, selected, legalTargets, sideToMove, onSquareClick }) => {
  return (
    <div className="relative w-full max-w-[560px]">
      <div className="aspect-[9/10] w-full rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-800 to-slate-900 p-2 shadow-2xl">
        <div className="flex h-full flex-col">
          {/* Top half: rows 0..4 */}
          <div className="grid grid-cols-9 grid-rows-5 gap-[2px]">
            {Array.from({ length: 5 }).map((_, yy) =>
              Array.from({ length: 9 }).map((_, x) => {
                const y = yy; // 0..4
                const isSelected = selected && selected.x === x && selected.y === y;
                const isTarget = legalTargets.some((c) => c.x === x && c.y === y);
                const piece = board[y][x];
                return (
                  <button
                    key={`t-${x}-${y}`}
                    onClick={() => onSquareClick(x, y)}
                    className={`relative flex items-center justify-center rounded-[8px] border ${
                      isSelected
                        ? "border-amber-400 bg-amber-400/10"
                        : "border-slate-900/60 bg-slate-950/60"
                    } focus:outline-none focus:ring-2 focus:ring-red-600/30`}
                  >
                    {isTarget && <span className="absolute h-2 w-2 rounded-full bg-emerald-400/90" />}
                    <Piece piece={piece} />
                  </button>
                );
              })
            )}
          </div>

          {/* River */}
          <div className="my-1 flex items-center">
            <span className="h-[1px] flex-1 bg-slate-700/70" aria-hidden />
            <span className="mx-3 rounded-md border border-slate-700/60 bg-slate-900/60 px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-slate-300">
              Chu He — Han Jie
            </span>
            <span className="h-[1px] flex-1 bg-slate-700/70" aria-hidden />
          </div>

          {/* Bottom half: rows 5..9 */}
          <div className="grid grid-cols-9 grid-rows-5 gap-[2px]">
            {Array.from({ length: 5 }).map((_, yy) =>
              Array.from({ length: 9 }).map((_, x) => {
                const y = yy + 5; // 5..9
                const isSelected = selected && selected.x === x && selected.y === y;
                const isTarget = legalTargets.some((c) => c.x === x && c.y === y);
                const piece = board[y][x];
                return (
                  <button
                    key={`b-${x}-${y}`}
                    onClick={() => onSquareClick(x, y)}
                    className={`relative flex items-center justify-center rounded-[8px] border ${
                      isSelected
                        ? "border-amber-400 bg-amber-400/10"
                        : "border-slate-900/60 bg-slate-950/60"
                    } focus:outline-none focus:ring-2 focus:ring-red-600/30`}
                  >
                    {isTarget && <span className="absolute h-2 w-2 rounded-full bg-emerald-400/90" />}
                    <Piece piece={piece} />
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
      <div className="mt-2 text-center text-[11px] text-slate-400">Turn: {sideToMove === "Red" ? "Red" : "Black"}</div>
    </div>
  );
};


export default Board;


// Local piece renderer
const Piece: React.FC<{ piece: string }> = ({ piece }) => {
  if (!piece) return null;
  const side = piece[0] === "r" ? "red" : "black";
  const type = piece.slice(1);
  const label = mapPieceLabel(type);

  if (label === "?") return null;

  return (
    <div
      className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold shadow ${
        side === "red"
          ? "border-red-500 bg-red-500/20 text-red-200"
          : "border-slate-500 bg-slate-500/20 text-slate-200"
      }`}
    >
      {label}
    </div>
  );
};


function mapPieceLabel(type: string): string {
  switch (type) {
    case "General": return "G"; // General
    case "Chariot": return "R"; // Rook
    case "Horse": return "H"; // Horse
    case "Elephant": return "E"; // Elephant
    case "Advisor": return "A"; // Advisor
    case "Cannon": return "C"; // Cannon
    case "Soldier": return "P"; // Pawn
    default: return "?";
  }
}
    