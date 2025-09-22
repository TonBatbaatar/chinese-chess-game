import React from "react";

const FeatureCard: React.FC<{ title: string; desc: string }> = ({ title, desc }) => (
  <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]">
    <div className="mb-3 inline-flex items-center justify-center rounded-xl bg-slate-800 p-2 text-slate-200">
      <span className="text-xs">★</span>
    </div>
    <h3 className="text-base font-semibold">{title}</h3>
    <p className="mt-1 text-sm text-slate-300/90">{desc}</p>
  </div>
);

export default FeatureCard;