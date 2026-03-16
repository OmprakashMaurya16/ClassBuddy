// ─────────────────────────────────────────────────────────────────────────────
// components/ConfirmModal.jsx
//
// Generic confirmation dialog — currently used for faculty deletion.
// Reusable for any destructive action by passing different props.
//
// PROPS
//   open      boolean   — controls visibility
//   onClose   () => void
//   onConfirm () => void — called when user clicks the confirm button
//   title     string    — modal header text  (default "Confirm")
//   message   ReactNode — body text
//   confirmLabel string — button label       (default "Delete")
//   loading   boolean   — shows spinner, disables buttons
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from "react";
import { X, Trash2, Loader2 } from "lucide-react";

const ConfirmModal = ({
  open,
  onClose,
  onConfirm,
  title        = "Confirm",
  message,
  confirmLabel = "Delete",
  loading      = false,
}) => {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handle = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <div className="text-sm text-gray-600 mb-6">{message}</div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-rose-500 text-white text-sm font-semibold rounded-xl hover:bg-rose-600 transition disabled:opacity-60"
            >
              {loading
                ? <Loader2 size={15} className="animate-spin" />
                : <Trash2 size={15} />}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;