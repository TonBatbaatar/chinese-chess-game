import React from "react";


const ActionPanel: React.FC<{
onOfferDraw?: () => void;
onResign?: () => void;
onFlipBoard?: () => void;
onSettings?: () => void;
}> = ({ onOfferDraw, onResign, onFlipBoard, onSettings }) => (
<div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
<div className="grid grid-cols-2 gap-3">
<button onClick={onOfferDraw} className="rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-800">Offer Draw</button>
<button onClick={onResign} className="rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-500">Resign</button>
</div>
<div className="mt-3 grid grid-cols-2 gap-3 text-xs">
<button onClick={onFlipBoard} className="rounded-xl border border-slate-700/80 px-3 py-2 text-slate-200 hover:bg-slate-800">Flip Board</button>
<button onClick={onSettings} className="rounded-xl border border-slate-700/80 px-3 py-2 text-slate-200 hover:bg-slate-800">Settings</button>
</div>
</div>
);


export default ActionPanel;