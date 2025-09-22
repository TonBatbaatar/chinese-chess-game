import React from "react";

export type Game = {
  id: string;
  red: { name: string; rating: number };
  black: { name: string; rating: number };
  moves: number;
  timeControl: string;
};

const GameCard: React.FC<{ game: Game; onSpectate: () => void }> = ({ game, onSpectate }) => {
  const { red, black, moves, timeControl } = game;
  return (
    <div className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-4 transition hover:border-slate-700">
      <div className="flex items-center justify-between text-xs text-slate-300">
        <span className="rounded-lg bg-slate-800/80 px-2 py-1">{timeControl}</span>
        <span>{moves} moves</span>
      </div>
      <div className="mt-3 grid grid-cols-2 items-center gap-3">
        <PlayerChip name={red.name} rating={red.rating} color="red" />
        <div className="text-center text-xs text-slate-500">vs</div>
        <PlayerChip name={black.name} rating={black.rating} color="black" />
      </div>
      <button onClick={onSpectate} className="mt-4 w-full rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-900 transition hover:bg-white">Spectate</button>
    </div>
  );
};

export default GameCard;

const PlayerChip: React.FC<{ name: string; rating: number; color: "red" | "black" }> = ({ name, rating, color }) => (
  <div className="flex items-center gap-2">
    <div className={`h-6 w-6 shrink-0 rounded-full border ${color === "red" ? "border-red-500 bg-red-500/20" : "border-slate-600 bg-slate-700"}`} />
    <div>
      <div className="text-sm font-medium leading-4">{name}</div>
      <div className="text-[10px] text-slate-400">{rating}</div>
    </div>
  </div>
);