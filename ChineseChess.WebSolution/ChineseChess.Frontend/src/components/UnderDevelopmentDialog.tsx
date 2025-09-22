import React from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  featureName?: string;
};

const UnderDevelopmentDialog: React.FC<Props> = ({ open, onClose, featureName }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
        <h3 className="mb-2 text-lg font-semibold text-white">
          🚧 {featureName || "This feature"}
        </h3>
        <p className="text-sm text-slate-300/90">
          Sorry, this is still under development. Please check back later!
        </p>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnderDevelopmentDialog;
