type Side = "Red" | "Black";

const fileToX: Record<string, number> = {
  A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6, H: 7, I: 8,
};

function coordFromStr(s: string): { x: number; y: number } {
  const file = s[0].toUpperCase();
  const rank = parseInt(s.slice(1), 10); // 1..10
  const x = fileToX[file];
  const y = 10 - rank; // 0..9 (0 = top)
  return { x, y };
}

function cloneBoard(board: string[][]): string[][] {
  return board.map(row => row.slice());
}

// Standard Xiangqi initial setup (letters: K,R,H,E,A,C,P)
// y=0 top is Black home rank; Red is at bottom (y=9)
export function makeInitialBoard(): string[][] {
  const emptyRow = () => Array(9).fill("");
  const b: string[][] = Array.from({ length: 10 }, emptyRow);

  // Black back rank (top)
  b[0] = ["bR","bH","bE","bA","bK","bA","bE","bH","bR"];
  // Black cannons
  b[2][1] = "bC"; b[2][7] = "bC";
  // Black soldiers
  [0,2,4,6,8].forEach(x => b[3][x] = "bP");

  // Red back rank (bottom)
  b[9] = ["rR","rH","rE","rA","rK","rA","rE","rH","rR"];
  // Red cannons
  b[7][1] = "rC"; b[7][7] = "rC";
  // Red soldiers
  [0,2,4,6,8].forEach(x => b[6][x] = "rP");

  return b;
}

export function applyMove(board: string[][], move: string): string[][] {
  // move like "H8-E8"
  const [fromStr, toStr] = move.split("-");
  const from = coordFromStr(fromStr);
  const to = coordFromStr(toStr);

  const next = cloneBoard(board);
  const piece = next[from.y][from.x];        // source piece
  next[from.y][from.x] = "";                 // empty source
  next[to.y][to.x] = piece || next[to.y][to.x]; // drop piece (simple capture/overwrite)
  return next;
}

export function boardAfterPly(moves: string[], ply: number): { board: string[][]; sideToMove: Side } {
  let b = makeInitialBoard();
  const sideToMove: Side = (ply % 2 === 0) ? "Red" : "Black"; // Red starts
  
  if (moves== null) return { board: b, sideToMove }; 
  for (let i = 0; i < Math.max(0, Math.min(ply, moves.length)); i++) {
    b = applyMove(b, moves[i]);
  }
  
  return { board: b, sideToMove };
}
