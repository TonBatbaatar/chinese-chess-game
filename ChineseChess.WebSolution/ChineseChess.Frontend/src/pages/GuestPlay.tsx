import { useEffect, useRef, useState } from "react";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
// If you already have a factory in src/lib/signalr.ts, use that instead:
// import { createConnection } from "../lib/signalr";

type Cell = { r: number; c: number; type: string; owner: string };
type BoardDto = { rows: number; cols: number; cells: Cell[]; currentPlayer: string };

export default function GuestPlay() {
  const [gameId, setGameId] = useState<string>("");
  const [joinedId, setJoinedId] = useState<string>("");
  const [board, setBoard] = useState<BoardDto | null>(null);
  const [status, setStatus] = useState<string>("disconnected");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [error, setError] = useState<string | null>(null);

  const connRef = useRef<HubConnection | null>(null);

  useEffect(() => {
    // Use Vite proxy (recommended in dev): withUrl('/hub/game')
    // Or use absolute URL if not proxying: withUrl('http://localhost:5000/hub/game')
    const conn = new HubConnectionBuilder()
      .withUrl("/hub/game")
      .withAutomaticReconnect()
      .build();

    connRef.current = conn;

    // server → client messages
    conn.on("State", (boardDto: BoardDto) => setBoard(boardDto));
    conn.on("MoveMade", (_move: any, boardDto: BoardDto) => setBoard(boardDto));
    conn.on("Joined", (_connId: string) => { /* optional */ });

    conn
      .start()
      .then(() => setStatus("connected"))
      .catch((err) => setStatus("error: " + String(err)));

    return () => {
      conn.stop();
    };
  }, []);

  async function createGame() {
    setError(null);
    if (!connRef.current) return;
    try {
      const result = await connRef.current.invoke<{ gameId: string; board: BoardDto }>("CreateGame");
      setGameId(result.gameId);
      setBoard(result.board);
    } catch (e) {
      setError(String(e));
    }
  }

  async function joinGame() {
    setError(null);
    if (!connRef.current || !joinedId) return;
    try {
      const ok = await connRef.current.invoke<boolean>("JoinGame", joinedId.trim());
      if (ok) setGameId(joinedId.trim());
      else setError("Failed to join. Check the Game ID.");
    } catch (e) {
      setError(String(e));
    }
  }

  async function sendMove() {
    setError(null);
    if (!connRef.current || !gameId || !from || !to) return;
    try {
      const res = await connRef.current.invoke<{ ok: boolean; error?: string }>(
        "MakeMove",
        gameId,
        from.trim().toUpperCase(),
        to.trim().toUpperCase()
      );
      if (!res.ok) setError(res.error ?? "Move rejected");
    } catch (e) {
      setError(String(e));
    }
  }

  return (
    <div className="min-h-dvh p-6 bg-gray-50">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Chinese Chess — Guest Play</h1>
            <p className="text-sm text-gray-600">Status: {status}</p>
          </div>
          {board && (
            <div className="text-sm text-gray-700">
              Current turn: <span className="font-semibold">{board.currentPlayer}</span>
            </div>
          )}
        </header>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={createGame}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Create Game
          </button>

          <div className="flex items-center gap-2">
            <input
              placeholder="Enter Game ID"
              value={joinedId}
              onChange={(e) => setJoinedId(e.currentTarget.value)}
              className="rounded-lg border border-gray-300 px-3 py-2"
            />
            <button
              onClick={joinGame}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
            >
              Join Game
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              placeholder='From (e.g. "A10")'
              value={from}
              onChange={(e) => setFrom(e.currentTarget.value)}
              className="rounded-lg border border-gray-300 px-3 py-2"
            />
            <span className="text-gray-500">→</span>
            <input
              placeholder='To (e.g. "A9")'
              value={to}
              onChange={(e) => setTo(e.currentTarget.value)}
              className="rounded-lg border border-gray-300 px-3 py-2"
            />
            <button
              onClick={sendMove}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
              disabled={!gameId}
            >
              Send Move
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700 text-sm">
            {error}
          </div>
        )}

        {gameId && (
          <div className="rounded-lg bg-white p-3 shadow border">
            <div>
              <span className="font-medium">Game ID:</span> <code>{gameId}</code>
            </div>
            <div className="text-sm text-gray-600">Share this ID with your opponent.</div>
          </div>
        )}

        <section className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <h2 className="font-semibold mb-2">Board</h2>
            {board ? (
              <BoardGrid board={board} />
            ) : (
              <div className="text-sm text-gray-500">No board yet. Create or join a game.</div>
            )}
          </div>

          <aside className="w-full max-w-sm rounded-lg bg-white p-4 shadow border">
            <h3 className="font-semibold mb-2">Legend</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li><span className="font-semibold text-red-600">Red</span> pieces</li>
              <li><span className="font-semibold text-gray-900">Black</span> pieces</li>
              <li><span className="text-gray-500">Dot</span> = empty cell</li>
              <li>River line between rows 5 and 6</li>
            </ul>
          </aside>
        </section>
      </div>
    </div>
  );
}

/* ------------------------- Board UI ------------------------- */

function BoardGrid({ board }: { board: BoardDto }) {
  const letters = axisLetters(board.cols);

  // piece lookup
  const grid: (Cell | null)[][] = Array.from({ length: board.rows }, () =>
    Array.from({ length: board.cols }, () => null)
  );
  for (const cell of board.cells) {
    grid[cell.r][cell.c] = cell.type === "None" ? null : cell;
  }

  return (
    <div className="inline-block">
      {/* Top letters */}
      <div className="ml-10 mb-1 flex items-center justify-center gap-2 text-xs text-gray-600 select-none">
        {letters.map((L) => (
          <div key={L} className="w-10 text-center">{L}</div>
        ))}
      </div>

      <div className="flex">
        {/* Left numbers 1..10 */}
        <div className="mr-2 flex flex-col justify-between text-xs text-gray-600 select-none">
          {Array.from({ length: board.rows }, (_, r) => (
            <div key={r} className="h-10 flex items-center justify-center w-8">
              {r + 1}
            </div>
          ))}
        </div>

        {/* Board with dashed border and river */}
        <div className="rounded-xl border-2 border-dashed border-gray-400 p-1 bg-white shadow-sm relative">
          {/* actual cells */}
          {grid.map((row, r) => (
            <div key={r} className="flex">
              {row.map((cell, c) => (
                <div
                  key={c}
                  className="w-10 h-10 border border-gray-200 flex items-center justify-center"
                >
                  {cell ? (
                    <span className={`font-semibold ${ownerColorClass(cell.owner)}`}>
                      {pieceChar(cell.type)}
                    </span>
                  ) : (
                    <span className="text-gray-300">·</span>
                  )}
                </div>
              ))}
            </div>
          ))}

          {/* River line across full width (between row 4 and 5, 0-based) */}
          <div
            className="absolute left-1 right-1 border-b-2 border-blue-200"
            style={{
              top: 1 + 5 * 40, // p-1 offset (≈4px) + 5 rows * 40px per cell row
              // If your sizing changes, adjust formula accordingly.
            }}
          />
        </div>

        {/* Right numbers 1..10 */}
        <div className="ml-2 flex flex-col justify-between text-xs text-gray-600 select-none">
          {Array.from({ length: board.rows }, (_, r) => (
            <div key={r} className="h-10 flex items-center justify-center w-8">
              {r + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom letters */}
      <div className="ml-10 mt-1 flex items-center justify-center gap-2 text-xs text-gray-600 select-none">
        {letters.map((L) => (
          <div key={L} className="w-10 text-center">{L}</div>
        ))}
      </div>
    </div>
  );
}

function axisLetters(cols: number) {
  return Array.from({ length: cols }, (_, c) =>
    String.fromCharCode("A".charCodeAt(0) + c)
  );
}

function pieceChar(type: string) {
  switch (type) {
    case "General": return "G";
    case "Advisor": return "A";
    case "Elephant": return "E";
    case "Horse": return "H";
    case "Chariot": return "R";  // choose "R" or "C" consistently
    case "Cannon": return "N";   // matches your earlier code
    case "Soldier": return "S";
    default: return "";
  }
}

function ownerColorClass(owner: string) {
  if (owner === "Red") return "text-red-600";
  if (owner === "Black") return "text-gray-900";
  return "text-transparent";
}
