import React from "react";

const BoardPreview: React.FC = () => (
  <div className="relative rounded-3xl border border-slate-800 bg-slate-900/40 p-4 shadow-2xl">
    <div className="aspect-square w-full rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 p-2">
      <div className="grid h-full grid-cols-9 grid-rows-10 gap-[2px]">
        {Array.from({ length: 90 }).map((_, i) => (
          <div key={i} className="bg-slate-950/60" />
        ))}
      </div>
    </div>
    <div className="pointer-events-none absolute inset-x-6 -bottom-4 mx-auto h-16 rounded-2xl bg-red-500/20 blur-2xl" />
  </div>
);

export default BoardPreview;