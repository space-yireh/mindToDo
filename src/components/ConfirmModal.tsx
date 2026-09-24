"use client";

import { useEffect, useRef } from "react";
import { useLanguage } from "@/components/LanguageProvider";

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const { t } = useLanguage();
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // without this, focus stays on whatever was focused behind the modal
    // (e.g. a selected mindmap node), so Enter/keys leak through to it
    // instead of the dialog that's visually on top
    confirmButtonRef.current?.focus();
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    e.stopPropagation();
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      onKeyDown={handleKeyDown}
    >
      <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl dark:border dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            {cancelLabel ?? t.cancel}
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
          >
            {confirmLabel ?? t.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
