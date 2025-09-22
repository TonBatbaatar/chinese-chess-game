import React from "react";

export type Friend = { id: string; name: string; rating: number };

const FriendRow: React.FC<{ friend: Friend }> = ({ friend }) => (
  <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/40 p-3">
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 rounded-full bg-slate-700" />
      <div>
        <div className="text-sm font-medium">{friend.name}</div>
        <div className="text-[10px] text-slate-400">{friend.rating}</div>
      </div>
    </div>
    <button className="rounded-xl border border-slate-700/80 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800">Invite</button>
  </div>
);

export default FriendRow;