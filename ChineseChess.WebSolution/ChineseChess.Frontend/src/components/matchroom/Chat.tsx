import React from "react";

const Chat: React.FC = () => (
  <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
    <div className="mb-2 text-sm font-semibold">Chat</div>
    <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-xs text-slate-400">
      Chat system coming soon…
    </div>
    <div className="mt-3 grid grid-cols-[1fr_auto] gap-2 text-xs">
      <input className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 outline-none placeholder:text-slate-500" placeholder="Type a message…" />
      <button className="rounded-xl border border-slate-700/80 px-3 py-2 text-slate-200 hover:bg-slate-800">Send</button>
    </div>
  </div>
);

export default Chat;