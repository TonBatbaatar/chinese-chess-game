import React from "react";


export type Player = { id?: string; name: string; rating?: number };


const PlayerCard: React.FC<{
    label: "Red" | "Black";
    player: Player;
    timer?: string;
    active?: boolean;
}> = ({ label, player, timer = "10:00", active = false }) => (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
    <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
    <span>{label} Player</span>
    <span className={`h-2 w-2 rounded-full ${active ? "bg-emerald-500" : "bg-slate-600"}`} />
    </div>
    <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
    <div className={`h-9 w-9 rounded-full ${label === "Red" ? "bg-red-600/40" : "bg-slate-600/40"}`} />
    <div>
    <div className="text-sm font-semibold">{player.name}</div>
    <div className="text-[10px] text-slate-400">{player.rating ?? "—"}</div>
    </div>
    </div>
    <div className={`rounded-xl px-2 py-1 text-xs ${active ? "bg-slate-200 text-slate-900" : "bg-slate-800 text-slate-300"}`}>{timer}</div>
    </div>
    </div>
);


export default PlayerCard;