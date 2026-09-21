"use client";

interface ToolbarProps {
  onImportClick: () => void;
  onExportClick: () => void;
  showCompleted: boolean;
  onToggleShowCompleted: () => void;
  disabled: boolean;
}

export function Toolbar({
  onImportClick,
  onExportClick,
  showCompleted,
  onToggleShowCompleted,
  disabled,
}: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-4 py-3">
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
        className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        내보내기
      </button>
      <label className="ml-2 flex select-none items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={showCompleted}
          onChange={onToggleShowCompleted}
          className="h-4 w-4 rounded border-slate-300"
        />
        완료된 할일 보기
      </label>
    </div>
  );
}
