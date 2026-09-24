"use client";

import type { TaskList } from "@/lib/types";

interface SidebarProps {
  taskLists: TaskList[];
  selectedTaskListId: string | null;
  onSelect: (taskListId: string) => void;
  onCreate: () => void;
  onDelete: (taskListId: string) => void;
  busy: boolean;
  open: boolean;
  onClose: () => void;
}

export function Sidebar({
  taskLists,
  selectedTaskListId,
  onSelect,
  onCreate,
  onDelete,
  busy,
  open,
  onClose,
}: SidebarProps) {
  return (
    <aside
      className={[
        "flex flex-col border-r border-slate-200 bg-white transition-all duration-200 ease-in-out dark:border-slate-800 dark:bg-slate-900",
        "fixed inset-y-0 left-0 z-40 md:static md:inset-auto",
        open
          ? "w-64 translate-x-0"
          : "w-64 -translate-x-full md:w-0 md:translate-x-0 md:overflow-hidden md:border-r-0",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-2 p-3">
        <button
          type="button"
          onClick={onCreate}
          disabled={busy}
          className="flex-1 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          + 새 목록
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 md:hidden"
          aria-label="목록 닫기"
        >
          ✕
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 pb-3">
        {taskLists.length === 0 && (
          <p className="px-2 py-4 text-center text-xs text-slate-400 dark:text-slate-500">목록이 없습니다.</p>
        )}
        <ul className="flex flex-col gap-1">
          {taskLists.map((list) => (
            <li key={list.id} className="group flex items-center gap-1">
              <button
                type="button"
                onClick={() => onSelect(list.id)}
                disabled={busy}
                className={`flex-1 truncate rounded-md px-2 py-1.5 text-left text-sm disabled:cursor-not-allowed ${
                  list.id === selectedTaskListId
                    ? "bg-indigo-50 font-medium text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/80"
                }`}
                title={list.title}
              >
                {list.title || "(제목 없음)"}
              </button>
              <button
                type="button"
                onClick={() => onDelete(list.id)}
                disabled={busy}
                className="shrink-0 rounded-md px-2 py-1.5 text-xs text-slate-400 opacity-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400 disabled:cursor-not-allowed group-hover:opacity-100"
                aria-label="목록 삭제"
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
