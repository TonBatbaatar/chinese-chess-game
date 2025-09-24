import React, { useEffect } from "react";

type ModalProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  actions?: React.ReactNode; // buttons row
};

const Modal: React.FC<ModalProps> = ({ open, title, onClose, children, actions }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-[min(92vw,420px)] rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-xl">
        {title && <div className="mb-2 text-sm font-semibold text-slate-100">{title}</div>}
        <div className="text-xs text-slate-300">{children}</div>
        {actions && <div className="mt-4 flex justify-end gap-2">{actions}</div>}
      </div>
    </div>
  );
};

export default Modal;
