"use client";

import { PanelIcon } from "@/components/Toolbar";
import { useLanguage } from "@/components/LanguageProvider";
import type { TaskList } from "@/lib/types";

interface SidebarToggleProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  taskLists: TaskList[];
  selectedTaskListId: string | null;
  onSelectTaskList: (taskListId: string) => void;
}

/**
 * The sidebar toggle button, plus — only while the sidebar is collapsed on
 * desktop — a hover popover listing task lists for a quick switch without
 * fully reopening the panel. Pure CSS (group-hover), same pattern as the
 * node box's hover-revealed +/x buttons: no JS hover state needed, and it
 * naturally never appears on touch (no hover), which is fine since the
 * mobile sidebar is a full-screen drawer with no "collapsed" state anyway.
 */
export function SidebarToggle({
  sidebarOpen,
  onToggleSidebar,
  taskLists,
  selectedTaskListId,
  onSelectTaskList,
}: SidebarToggleProps) {
  const { t } = useLanguage();
  const showPopover = !sidebarOpen && taskLists.length > 0;

  return (
    <div className="group relative shrink-0">
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-pressed={sidebarOpen}
        aria-label={t.toggleSidebar}
        title={t.toggleSidebar}
        className={`rounded-lg p-2 transition-colors ${
          sidebarOpen
            ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
            : "text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-900 dark:hover:text-slate-300"
        }`}
      >
        <PanelIcon side="left" />
      </button>

      {showPopover && (
        <div
          className="pointer-events-none absolute left-0 top-full z-50 mt-1 w-56 rounded-lg border border-slate-200 bg-white p-1.5 opacity-0 shadow-lg transition-opacity delay-150 group-hover:pointer-events-auto group-hover:opacity-100 dark:border-slate-700 dark:bg-slate-900"
          role="menu"
        >
          <p className="px-2 py-1 text-xs font-medium text-slate-400 dark:text-slate-500">
            {t.quickSwitchLabel}
          </p>
          <ul className="flex max-h-72 flex-col gap-0.5 overflow-y-auto">
            {taskLists.map((list) => (
              <li key={list.id}>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => onSelectTaskList(list.id)}
                  className={`w-full truncate rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                    list.id === selectedTaskListId
                      ? "bg-indigo-50 font-medium text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                  title={list.title}
                >
                  {list.title || t.untitled}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
