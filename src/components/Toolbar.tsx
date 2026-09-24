"use client";

import { useSyncExternalStore } from "react";
import { LoadingBar, Spinner } from "@/components/LoadingBar";
import { useTheme } from "@/components/ThemeProvider";
import { useLanguage } from "@/components/LanguageProvider";

const emptySubscribe = () => () => {};
function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

interface ToolbarProps {
  onImportClick: () => void;
  onExportClick: () => void;
  showCompleted: boolean;
  onToggleShowCompleted: () => void;
  disabled: boolean;
  busy: boolean;
  busyLabel?: string;
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

// eye / eye-with-slash — used for the "show completed" toggle so it reads
// as a real control on narrow screens instead of a bare, unlabeled checkbox
// (the label text is hidden below `sm` to save space in the packed mobile
// toolbar; the icon carries the meaning there instead)
function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M2 10s3-5.5 8-5.5 8 5.5 8 5.5-3 5.5-8 5.5-8-5.5-8-5.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.4" />
      {off && <path d="M3 17L17 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />}
    </svg>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  const mounted = useIsMounted();

  const activeTheme = mounted ? theme : "system";

  // Icon-only buttons (no label text) – compact for mobile
  const btnBase =
    "flex items-center justify-center rounded-lg px-2 py-1.5 text-sm transition-colors";
  const activeClass = "bg-white font-medium text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100";
  const inactiveClass = "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200";

  return (
    <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100/70 p-0.5 dark:border-slate-800 dark:bg-slate-900/80 select-none">
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={`${btnBase} ${activeTheme === "light" ? activeClass : inactiveClass}`}
        title={t.themeLight}
        aria-label={t.themeLight}
      >
        <span aria-hidden>☀️</span>
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={`${btnBase} ${activeTheme === "dark" ? activeClass : inactiveClass}`}
        title={t.themeDark}
        aria-label={t.themeDark}
      >
        <span aria-hidden>🌙</span>
      </button>
      <button
        type="button"
        onClick={() => setTheme("system")}
        className={`${btnBase} ${activeTheme === "system" ? activeClass : inactiveClass}`}
        title={t.themeSystem}
        aria-label={t.themeSystem}
      >
        <span aria-hidden>💻</span>
      </button>
    </div>
  );
}

function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();
  const mounted = useIsMounted();

  const activeLanguage = mounted ? language : "ko";

  const btnBase =
    "flex items-center justify-center rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors";
  const activeClass = "bg-white font-medium text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100";
  const inactiveClass = "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200";

  return (
    <div
      className="flex items-center rounded-lg border border-slate-200 bg-slate-100/70 p-0.5 dark:border-slate-800 dark:bg-slate-900/80 select-none"
      role="group"
      aria-label={t.languageToggle}
    >
      <button
        type="button"
        onClick={() => setLanguage("ko")}
        className={`${btnBase} ${activeLanguage === "ko" ? activeClass : inactiveClass}`}
        title="한국어"
        aria-label="한국어"
        aria-pressed={activeLanguage === "ko"}
      >
        한
      </button>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`${btnBase} ${activeLanguage === "en" ? activeClass : inactiveClass}`}
        title="English"
        aria-label="English"
        aria-pressed={activeLanguage === "en"}
      >
        EN
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
  busy,
  busyLabel,
  sidebarOpen,
  onToggleSidebar,
  propertiesOpen,
  onToggleProperties,
}: ToolbarProps) {
  const { t } = useLanguage();
  return (
    <>
      <LoadingBar loading={busy} label={busyLabel} />
    <div className="flex items-center gap-1.5 border-b border-slate-200 bg-white px-2 py-2 dark:border-slate-800 dark:bg-slate-950 min-h-[48px]">
      {/* Left: sidebar toggle */}
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-pressed={sidebarOpen}
        aria-label={t.toggleSidebar}
        title={t.toggleSidebar}
        className={`shrink-0 rounded-lg p-2 transition-colors ${
          sidebarOpen
            ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
            : "text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-900 dark:hover:text-slate-300"
        }`}
      >
        <PanelIcon side="left" />
      </button>

      {/* Center: import / export / show-completed */}
      <div className="flex flex-1 items-center gap-1.5 overflow-hidden">
        <button
          type="button"
          onClick={onImportClick}
          disabled={disabled}
          className="shrink-0 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900 transition-colors"
        >
          {busy ? (
            <span className="flex items-center gap-1.5">
              <Spinner className="h-3.5 w-3.5" />
              {t.importing}
            </span>
          ) : t.import}
        </button>
        <button
          type="button"
          onClick={onExportClick}
          disabled={disabled}
          className="shrink-0 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 active:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
        >
          {busy ? (
            <span className="flex items-center gap-1.5">
              <Spinner className="h-3.5 w-3.5" />
              {t.exporting}
            </span>
          ) : t.export}
        </button>

        {/* "완료된 할일 보기" — icon+text on ≥sm, icon-only on mobile (never
            a bare unlabeled checkbox — see EyeIcon comment above) */}
        <button
          type="button"
          onClick={onToggleShowCompleted}
          aria-pressed={showCompleted}
          aria-label={t.showCompleted}
          title={t.showCompleted}
          className={`ml-1 flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs transition-colors ${
            showCompleted
              ? "bg-slate-100 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
              : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900"
          }`}
        >
          <EyeIcon off={!showCompleted} />
          <span className="hidden sm:inline whitespace-nowrap">{t.showCompleted}</span>
        </button>
      </div>

      {/* Right: language toggle + theme toggle + properties toggle */}
      <div className="flex shrink-0 items-center gap-1.5">
        <LanguageToggle />
        <ThemeToggle />
        <button
          type="button"
          onClick={onToggleProperties}
          aria-pressed={propertiesOpen}
          aria-label={t.toggleProperties}
          title={t.toggleProperties}
          className={`rounded-lg p-2 transition-colors ${
            propertiesOpen
              ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
              : "text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-900 dark:hover:text-slate-300"
          }`}
        >
          <PanelIcon side="right" />
        </button>
      </div>
    </div>
    </>
  );
}
