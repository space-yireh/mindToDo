"use client";

import { useTheme } from "@/components/ThemeProvider";

interface ToolbarProps {
  onImportClick: () => void;
  onExportClick: () => void;
  showCompleted: boolean;
  onToggleShowCompleted: () => void;
  disabled: boolean;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  propertiesOpen: boolean;
  onToggleProperties: () => void;
}

export function PanelIcon({ side }: { side: "left" | "right" }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <rect x="2.5" y="3.5" width="15" height="13" rx="2" stroke="currentColor" strokeWidth="1.4" />
      {side === "left" ? (
        <path d="M7.5 3.5V16.5" stroke="currentColor" strokeWidth="1.4" />
      ) : (
        <path d="M12.5 3.5V16.5" stroke="currentColor" strokeWidth="1.4" />
      )}
    </svg>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100/70 p-0.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400 select-none">
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={`flex items-center gap-1 rounded-md px-2 py-1 transition-colors ${
          theme === "light"
            ? "bg-white font-medium text-slate-900 shadow-xs dark:bg-slate-800 dark:text-slate-100"
            : "hover:text-slate-900 dark:hover:text-slate-200"
        }`}
        title="라이트 모드"
      >
        <span>☀️</span>
        <span className="hidden sm:inline">라이트</span>
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={`flex items-center gap-1 rounded-md px-2 py-1 transition-colors ${
          theme === "dark"
            ? "bg-white font-medium text-slate-900 shadow-xs dark:bg-slate-800 dark:text-slate-100"
            : "hover:text-slate-900 dark:hover:text-slate-200"
        }`}
        title="다크 모드"
      >
        <span>🌙</span>
        <span className="hidden sm:inline">다크</span>
      </button>
      <button
        type="button"
        onClick={() => setTheme("system")}
        className={`flex items-center gap-1 rounded-md px-2 py-1 transition-colors ${
          theme === "system"
            ? "bg-white font-medium text-slate-900 shadow-xs dark:bg-slate-800 dark:text-slate-100"
            : "hover:text-slate-900 dark:hover:text-slate-200"
        }`}
        title="OS 시스템 설정"
      >
        <span>💻</span>
        <span className="hidden sm:inline">시스템</span>
      </button>
    </div>
  );
}

export function Toolbar({
  onImportClick,
  onExportClick,
  showCompleted,
  onToggleShowCompleted,
  disabled,
  sidebarOpen,
  onToggleSidebar,
  propertiesOpen,
  onToggleProperties,
}: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-3 py-2.5 dark:border-slate-800 dark:bg-slate-950">
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-pressed={sidebarOpen}
        aria-label="목록 패널 토글"
        title="목록 패널 토글"
        className={`rounded-md p-1.5 ${
          sidebarOpen
            ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
            : "text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-900 dark:hover:text-slate-300"
        }`}
      >
        <PanelIcon side="left" />
      </button>

      <div className="ml-1 flex items-center gap-2">
        <button
          type="button"
          onClick={onImportClick}
          disabled={disabled}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
        >
          가져오기
        </button>
        <button
          type="button"
          onClick={onExportClick}
          disabled={disabled}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          내보내기
        </button>
        <label className="ml-2 flex select-none items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={onToggleShowCompleted}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-400 dark:border-slate-700 dark:bg-slate-900"
          />
          완료된 할일 보기
        </label>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />

        <button
          type="button"
          onClick={onToggleProperties}
          aria-pressed={propertiesOpen}
          aria-label="속성 패널 토글"
          title="속성 패널 토글"
          className={`rounded-md p-1.5 ${
            propertiesOpen
              ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
              : "text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-900 dark:hover:text-slate-300"
          }`}
        >
          <PanelIcon side="right" />
        </button>
      </div>
    </div>
  );
}

