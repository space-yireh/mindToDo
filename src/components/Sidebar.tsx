"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { LegalFooter } from "@/components/LegalFooter";
import type { TaskList } from "@/lib/types";

function TrashIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6h12M8 6V4.5A1.5 1.5 0 019.5 3h1A1.5 1.5 0 0112 4.5V6m-6.5 0 .5 10a1 1 0 001 1h5a1 1 0 001-1l.5-10"
      />
      <path strokeLinecap="round" d="M8.5 9v5M11.5 9v5" />
    </svg>
  );
}

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
  const { t } = useLanguage();
  return (
    <aside
      className={[
        // Desktop: static left panel that collapses to width-0
        "flex flex-col border-r border-slate-200 bg-white transition-all duration-250 ease-in-out dark:border-slate-800 dark:bg-slate-900",
        "md:static md:inset-auto md:z-auto",
        // Mobile: full-screen left slide-in drawer
        "fixed inset-y-0 left-0 z-40",
        open
          ? "w-full translate-x-0 md:w-64"
          : "-translate-x-full md:w-0 md:translate-x-0 md:overflow-hidden md:border-r-0",
      ].join(" ")}
    >
      {/* Brand */}
      <div className="flex items-center gap-2 border-b border-slate-100 p-4 dark:border-slate-800">
        {/* eslint-disable-next-line @next/next/no-img-element -- tiny static
            SVG mark; next/image needs dangerouslyAllowSVG for .svg sources,
            not worth the config change for one decorative 28px icon */}
        <img src="/logo.svg" alt="" className="h-7 w-7 shrink-0" />
        <span className="text-lg font-bold tracking-tight text-indigo-600 dark:text-indigo-400">MindToDo</span>
      </div>

      {/* New list button */}
      <div className="p-4">
        <button
          type="button"
          onClick={onCreate}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 active:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {t.newList}
        </button>
      </div>

      {/* List */}
      <nav className="flex-1 overflow-y-auto px-3 pb-6">
        {taskLists.length === 0 && (
          <p className="px-2 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
            {t.noLists}
          </p>
        )}
        <ul className="flex flex-col gap-1">
          {taskLists.map((list) => (
            <li key={list.id} className="group flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  onSelect(list.id);
                  onClose(); // auto-close on mobile after selection
                }}
                disabled={busy}
                className={`flex-1 truncate rounded-xl px-3 py-3 text-left text-sm font-medium disabled:cursor-not-allowed transition-colors ${
                  list.id === selectedTaskListId
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                    : "text-slate-600 hover:bg-slate-100 active:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800/80"
                }`}
                title={list.title}
              >
                {list.title || t.untitled}
              </button>
              <button
                type="button"
                onClick={() => onDelete(list.id)}
                disabled={busy}
                className="flex shrink-0 items-center gap-1 rounded-lg px-3 py-2 text-xs text-slate-400 opacity-100 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400 disabled:cursor-not-allowed md:opacity-0 md:group-hover:opacity-100 md:transition-opacity"
                aria-label={t.deleteListAria}
                title={t.deleteListAria}
              >
                <TrashIcon />
                <span>{t.delete}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-slate-100 p-3 dark:border-slate-800">
        <LegalFooter />
      </div>
    </aside>
  );
}
