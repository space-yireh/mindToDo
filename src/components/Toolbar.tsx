"use client";

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
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-3 py-3">
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-pressed={sidebarOpen}
        aria-label="목록 패널 토글"
        title="목록 패널 토글"
        className={`rounded-md p-1.5 ${
          sidebarOpen ? "bg-slate-100 text-slate-700" : "text-slate-400 hover:bg-slate-100"
        }`}
      >
        <PanelIcon side="left" />
      </button>

      <div className="ml-1 flex items-center gap-2">
        <button
          type="button"
          onClick={onImportClick}
          disabled={disabled}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
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
        <label className="ml-2 flex select-none items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={onToggleShowCompleted}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-400"
          />
          완료된 할일 보기
        </label>
      </div>

      <button
        type="button"
        onClick={onToggleProperties}
        aria-pressed={propertiesOpen}
        aria-label="속성 패널 토글"
        title="속성 패널 토글"
        className={`ml-auto rounded-md p-1.5 ${
          propertiesOpen ? "bg-slate-100 text-slate-700" : "text-slate-400 hover:bg-slate-100"
        }`}
      >
        <PanelIcon side="right" />
      </button>
    </div>
  );
}
