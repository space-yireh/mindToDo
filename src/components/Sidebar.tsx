"use client";

import type { TaskList } from "@/lib/types";

interface SidebarProps {
  taskLists: TaskList[];
  selectedTaskListId: string | null;
  onSelect: (taskListId: string) => void;
  onCreate: () => void;
  onDelete: (taskListId: string) => void;
  busy: boolean;
}

export function Sidebar({
  taskLists,
  selectedTaskListId,
  onSelect,
  onCreate,
  onDelete,
  busy,
}: SidebarProps) {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-slate-50">
      <div className="p-3">
        <button
          type="button"
          onClick={onCreate}
          disabled={busy}
          className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          + 새 목록
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 pb-3">
        {taskLists.length === 0 && (
          <p className="px-2 py-4 text-center text-xs text-slate-400">목록이 없습니다.</p>
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
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-200"
                }`}
                title={list.title}
              >
                {list.title || "(제목 없음)"}
              </button>
              <button
                type="button"
                onClick={() => onDelete(list.id)}
                disabled={busy}
                className="shrink-0 rounded-md px-2 py-1.5 text-xs text-slate-400 opacity-0 hover:bg-red-100 hover:text-red-600 disabled:cursor-not-allowed group-hover:opacity-100"
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
