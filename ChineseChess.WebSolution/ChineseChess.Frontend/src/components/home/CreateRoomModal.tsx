import React, { useState } from "react";

const CreateRoomModal: React.FC<{
  onClose: () => void;
  onConfirm: (opts: { timeControl: string; isPrivate: boolean }) => void;
}> = ({ onClose, onConfirm }) => {
  const [timeControl, setTimeControl] = useState<string>("10|0");
  const [isPrivate, setIsPrivate] = useState<boolean>(true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold">Create Room</h3>
          <button onClick={onClose} className="rounded-lg border border-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-900">Close</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs text-slate-300">Time Control</label>
            <select value={timeControl} onChange={(e) => setTimeControl(e.target.value)} className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-600/30">
              <option>3|2</option>
              <option>5|5</option>
              <option>10|0</option>
              <option>15|10</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-red-600 focus:ring-0" />
            Private room (invite via code)
          </label>
          <button onClick={() => onConfirm({ timeControl, isPrivate })} className="w-full rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500">Create</button>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomModal;