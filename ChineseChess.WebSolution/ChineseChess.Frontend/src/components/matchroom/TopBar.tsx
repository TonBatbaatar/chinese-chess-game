import React from "react";


export type TopBarProps = {
roomId: string;
statusText?: string;
onBack?: () => void;
};


const TopBar: React.FC<TopBarProps> = ({ roomId, statusText, onBack }) => (

  <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur">
    <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800"
        >
          Back
        </button>
        <div className="inline-flex items-center gap-2 text-sm">
          <LogoIcon className="h-5 w-5 text-red-500" />
          <span className="font-semibold">Room</span>
          <span className="rounded-lg bg-slate-800 px-2 py-0.5 text-xs text-slate-300">{roomId}</span>
        </div>
      </div>
      <div className="text-xs text-slate-400">{statusText ?? "Connected"}</div>
    </div>
  </header>
);


export default TopBar;


// ---- Local icon  ----
type IconProps = { className?: string };
const LogoIcon: React.FC<IconProps> = ({ className = "" }) => (
<svg viewBox="0 0 24 24" fill="currentColor" className={className}>
<path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm0 2a8 8 0 1 1-8 8 8.009 8.009 0 0 1 8-8Zm-3 7h6v2H9z" />
</svg>
);