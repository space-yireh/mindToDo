"use client";

import { useEffect, useReducer } from "react";

interface LoadingBarProps {
  loading: boolean;
  /** Optional label shown centered below the bar */
  label?: string;
}

type BarState = { visible: boolean; progress: number; fading: boolean };
type BarAction =
  | { type: "START" }
  | { type: "FILL"; value: number }
  | { type: "COMPLETE" }
  | { type: "FADE" }
  | { type: "HIDE" };

function barReducer(state: BarState, action: BarAction): BarState {
  switch (action.type) {
    case "START":
      return { visible: true, progress: 0, fading: false };
    case "FILL":
      return { ...state, progress: action.value };
    case "COMPLETE":
      return { ...state, progress: 100 };
    case "FADE":
      return { ...state, fading: true };
    case "HIDE":
      return { visible: false, progress: 0, fading: false };
  }
}

/**
 * A thin animated progress bar that appears at the very top of the page
 * while an async operation is in progress.
 */
export function LoadingBar({ loading, label }: LoadingBarProps) {
  const [{ visible, progress, fading }, dispatch] = useReducer(barReducer, {
    visible: false,
    progress: 0,
    fading: false,
  });

  useEffect(() => {
    if (loading) {
      dispatch({ type: "START" });
      const t1 = setTimeout(() => dispatch({ type: "FILL", value: 30 }), 30);
      const t2 = setTimeout(() => dispatch({ type: "FILL", value: 80 }), 400);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else {
      dispatch({ type: "COMPLETE" });
      const t1 = setTimeout(() => dispatch({ type: "FADE" }), 200);
      const t2 = setTimeout(() => dispatch({ type: "HIDE" }), 600);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [loading]);

  if (!visible) return null;

  return (
    <>
      {/* Top bar */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-[9999] h-[3px]"
        style={{ opacity: fading ? 0 : 1, transition: "opacity 400ms ease" }}
      >
        <div
          className="h-full bg-indigo-500 shadow-[0_0_8px_2px_rgba(99,102,241,0.6)]"
          style={{
            width: `${progress}%`,
            transition:
              progress === 100
                ? "width 200ms ease-out"
                : "width 600ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </div>

      {/* Centered label overlay (optional) */}
      {label && (
        <div
          className="pointer-events-none fixed inset-0 z-[9998] flex items-center justify-center"
          style={{ opacity: fading ? 0 : 1, transition: "opacity 400ms ease" }}
        >
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white/90 px-5 py-3 shadow-lg backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/90">
            <Spinner />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
          </div>
        </div>
      )}
    </>
  );
}

/** Small inline spinner for use inside buttons */
export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={`${className} animate-spin text-current`}
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
