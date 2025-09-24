import React, { useState } from "react";
import Modal from "./Modal";

type Props = {
  onOfferDraw?: () => void;     // server call in parent
  onResign?: () => void;        // server call in parent (only after confirm)
  onFlipBoard?: () => void;     // pure frontend in parent
  onSettings?: () => void;      // optional; we’ll show a dialog locally anyway
};

const ActionPanel: React.FC<Props> = ({ onOfferDraw, onResign, onSettings }) => {
  const [showResign, setShowResign] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onOfferDraw}
          className="rounded-xl border border-slate-700/80 bg-slate-800/60 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-800"
        >
          Offer Draw
        </button>

        <button
          onClick={() => setShowResign(true)}
          className="rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-500"
        >
          Resign
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
        <button
          onClick={() => setShowSettings(true)}
          className="rounded-xl border border-slate-700/80 px-3 py-2 text-slate-200 hover:bg-slate-800"
        >
          Flip Board
        </button>

        <button
          onClick={() => { setShowSettings(true); onSettings?.(); }}
          className="rounded-xl border border-slate-700/80 px-3 py-2 text-slate-200 hover:bg-slate-800"
        >
          Settings
        </button>
      </div>

      {/* Resign confirm dialog */}
      <Modal
        open={showResign}
        title="Confirm Resign"
        onClose={() => setShowResign(false)}
        actions={
          <>
            <button
              onClick={() => setShowResign(false)}
              className="rounded-lg border border-slate-700/80 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={() => { setShowResign(false); onResign?.(); }}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500"
            >
              Yes, resign
            </button>
          </>
        }
      >
        Are you sure you want to resign? This will immediately end the game.
      </Modal>

      {/* Settings under construction */}
      <Modal
        open={showSettings}
        title="🚧 Sorry!"
        onClose={() => setShowSettings(false)}
        actions={
          <button
            onClick={() => setShowSettings(false)}
            className="rounded-lg border border-slate-700/80 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800"
          >
            Close
          </button>
        }
      >
        This button is under development. Coming soon…
      </Modal>


    </div>
  );
};

export default ActionPanel;
