"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ConfirmModal } from "@/components/ConfirmModal";
import { MindMapCanvas } from "@/components/MindMapCanvas";
import { LoginScreen } from "@/components/LoginScreen";
import { PropertiesPanel } from "@/components/PropertiesPanel";
import { Sidebar } from "@/components/Sidebar";
import { PanelIcon, Toolbar } from "@/components/Toolbar";
import { useToast } from "@/components/ToastProvider";
import { useLanguage } from "@/components/LanguageProvider";
import {
  GoogleTasksApiError,
  createTaskList,
  deleteTaskList,
  listTaskLists,
} from "@/lib/googleTasksApi";
import { emptyMindMap } from "@/lib/mindmapConvert";
import { getPostDeleteSelection } from "@/lib/mindmapLayout";
import { exportMindMap, importMindMap } from "@/lib/sync";
import {
  addLeafNode,
  addTaskNode,
  findSelectedNode,
  removeLeafNode,
  removeTaskNode,
  updateLeafNode,
  updateTaskNode,
} from "@/lib/treeOps";
import type { MindMap, Selection, TaskList } from "@/lib/types";
import { useGoogleAuth } from "@/lib/useGoogleAuth";

interface PendingAction {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
}

export default function Home() {
  const auth = useGoogleAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [selectedTaskListId, setSelectedTaskListId] = useState<string | null>(null);
  const [mindMap, setMindMap] = useState<MindMap | null>(null);
  const [originalTitle, setOriginalTitle] = useState<string>("");
  const [selection, setSelection] = useState<Selection>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [busyLabel, setBusyLabel] = useState<string | undefined>();
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [propertiesOpen, setPropertiesOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // start collapsed on narrow screens; SSR/first paint assumes desktop
  // (both open) since window isn't available until after mount
  useEffect(() => {
    function applyMobileDefaults() {
      const mobile = window.matchMedia("(max-width: 767px)").matches;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
        setPropertiesOpen(false);
      }
    }
    applyMobileDefaults();
    const mq = window.matchMedia("(max-width: 767px)");
    const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  const wasSignedInRef = useRef(false);

  // undo/redo history for local canvas edits only (not import/export).
  // Kept in refs rather than state since nothing in the UI needs to
  // re-render off stack length, which also sidesteps async-state timing
  // issues when undo/redo need to read-then-write synchronously.
  const undoStackRef = useRef<MindMap[]>([]);
  const redoStackRef = useRef<MindMap[]>([]);
  const pendingBaselineRef = useRef<MindMap | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetHistory = useCallback(() => {
    undoStackRef.current = [];
    redoStackRef.current = [];
    pendingBaselineRef.current = null;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  const flushHistory = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (pendingBaselineRef.current) {
      undoStackRef.current = [...undoStackRef.current, pendingBaselineRef.current];
      pendingBaselineRef.current = null;
    }
  }, []);

  // commit a local mindmap edit as one undo step. `immediate` flushes right
  // away (discrete actions like add/delete/toggle); omitted, it debounces
  // so a burst of keystrokes in a text field collapses into one undo step.
  const commitMindMap = useCallback(
    (next: MindMap, opts?: { immediate?: boolean }) => {
      if (!mindMap) return;
      if (pendingBaselineRef.current === null) {
        pendingBaselineRef.current = mindMap;
      }
      redoStackRef.current = [];
      setMindMap(next);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (opts?.immediate) {
        flushHistory();
      } else {
        debounceTimerRef.current = setTimeout(flushHistory, 600);
      }
    },
    [mindMap, flushHistory],
  );

  const handleUndo = useCallback(() => {
    flushHistory();
    if (undoStackRef.current.length === 0 || !mindMap) return;
    const prev = undoStackRef.current[undoStackRef.current.length - 1];
    undoStackRef.current = undoStackRef.current.slice(0, -1);
    redoStackRef.current = [...redoStackRef.current, mindMap];
    setMindMap(prev);
    setSelection(null);
  }, [flushHistory, mindMap]);

  const handleRedo = useCallback(() => {
    flushHistory();
    if (redoStackRef.current.length === 0 || !mindMap) return;
    const next = redoStackRef.current[redoStackRef.current.length - 1];
    redoStackRef.current = redoStackRef.current.slice(0, -1);
    undoStackRef.current = [...undoStackRef.current, mindMap];
    setMindMap(next);
    setSelection(null);
  }, [flushHistory, mindMap]);

  // global undo/redo shortcut. Skipped while focus is in a text field so
  // the browser's own field-level undo (editing text) takes priority.
  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      const isMeta = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();
      if (!isMeta || (key !== "z" && key !== "y")) return;
      const tag = (document.activeElement?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      e.preventDefault();
      if (key === "y" || (key === "z" && e.shiftKey)) {
        handleRedo();
      } else {
        handleUndo();
      }
    }
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [handleUndo, handleRedo]);

  const handleApiError = useCallback(
    (err: unknown, fallbackMessage: string) => {
      if (err instanceof GoogleTasksApiError && err.status === 401) {
        auth.handleUnauthorized();
        showToast(t.toastSessionExpired, "error");
        return;
      }
      const message = err instanceof Error ? err.message : fallbackMessage;
      showToast(`${fallbackMessage}: ${message}`, "error");
    },
    [auth, showToast, t],
  );

  // load task lists once signed in
  useEffect(() => {
    if (!auth.accessToken) return;
    let cancelled = false;
    const token = auth.accessToken;
    const run = async () => {
      setBusy(true);
      try {
        const items = await listTaskLists(token);
        if (cancelled) return;
        setTaskLists(items.map((i) => ({ id: i.id, title: i.title })));
      } catch (err) {
        if (!cancelled) handleApiError(err, t.toastListsLoadFailed);
      } finally {
        if (!cancelled) setBusy(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.accessToken]);

  // reset canvas state on sign-out
  useEffect(() => {
    if (!auth.accessToken && wasSignedInRef.current) {
      setTaskLists([]);
      setSelectedTaskListId(null);
      setMindMap(null);
      setSelection(null);
    }
    wasSignedInRef.current = Boolean(auth.accessToken);
  }, [auth.accessToken, wasSignedInRef]);

  const doImport = useCallback(
    async (taskListId: string, taskListTitle: string) => {
      if (!auth.accessToken) return;
      setBusy(true);
      setBusyLabel(t.importing);
      try {
        const imported = await importMindMap(auth.accessToken, taskListId, taskListTitle);
        setMindMap(imported);
        setOriginalTitle(imported.title);
        setSelectedTaskListId(taskListId);
        setSelection(null);
        resetHistory();
        showToast(t.toastImportSuccess, "success");
      } catch (err) {
        handleApiError(err, t.toastImportFailed);
      } finally {
        setBusy(false);
        setBusyLabel(undefined);
      }
    },
    [auth.accessToken, handleApiError, showToast, resetHistory, t],
  );

  const handleSelectTaskList = useCallback(
    (taskListId: string) => {
      if (taskListId === selectedTaskListId || busy) return;
      const list = taskLists.find((tl) => tl.id === taskListId);
      void doImport(taskListId, list?.title ?? "");
    },
    [busy, doImport, selectedTaskListId, taskLists],
  );

  const handleCreateTaskList = useCallback(async () => {
    if (!auth.accessToken || busy) return;
    setBusy(true);
    try {
      const created = await createTaskList(auth.accessToken, t.newList);
      setTaskLists((prev) => [...prev, { id: created.id, title: created.title }]);
      setSelectedTaskListId(created.id);
      setMindMap(emptyMindMap(created.id, created.title));
      setOriginalTitle(created.title);
      setSelection(null);
      resetHistory();
      showToast(t.toastListCreated, "success");
    } catch (err) {
      handleApiError(err, t.toastListCreateFailed);
    } finally {
      setBusy(false);
    }
  }, [auth.accessToken, busy, handleApiError, showToast, resetHistory, t]);

  const handleDeleteTaskList = useCallback(
    (taskListId: string) => {
      const list = taskLists.find((tl) => tl.id === taskListId);
      setPendingAction({
        title: t.deleteListTitle,
        message: t.deleteListMessage(list?.title ?? ""),
        confirmLabel: t.delete,
        onConfirm: async () => {
          if (!auth.accessToken) return;
          setPendingAction(null);
          setBusy(true);
          try {
            await deleteTaskList(auth.accessToken, taskListId);
            setTaskLists((prev) => prev.filter((tl) => tl.id !== taskListId));
            if (taskListId === selectedTaskListId) {
              setSelectedTaskListId(null);
              setMindMap(null);
              setSelection(null);
              resetHistory();
            }
            showToast(t.toastListDeleted, "success");
          } catch (err) {
            handleApiError(err, t.toastListDeleteFailed);
          } finally {
            setBusy(false);
          }
        },
      });
    },
    [auth.accessToken, handleApiError, selectedTaskListId, showToast, taskLists, resetHistory, t],
  );

  const handleImportClick = useCallback(() => {
    if (!selectedTaskListId || !mindMap) return;
    setPendingAction({
      title: t.importTitle,
      message: t.importMessage,
      confirmLabel: t.import,
      onConfirm: () => {
        setPendingAction(null);
        void doImport(selectedTaskListId, mindMap.title);
      },
    });
  }, [doImport, mindMap, selectedTaskListId, t]);

  const handleExportClick = useCallback(() => {
    if (!mindMap || !auth.accessToken) return;
    setPendingAction({
      title: t.exportTitle,
      message: t.exportMessage,
      confirmLabel: t.export,
      onConfirm: async () => {
        setPendingAction(null);
        if (!mindMap || !auth.accessToken) return;
        setBusy(true);
        setBusyLabel(t.exporting);
        try {
          await exportMindMap(auth.accessToken, mindMap, originalTitle);
          setOriginalTitle(mindMap.title);
          setTaskLists((prev) =>
            prev.map((tl) => (tl.id === mindMap.taskListId ? { ...tl, title: mindMap.title } : tl)),
          );
          showToast(t.toastExportSuccess, "success");
        } catch (err) {
          handleApiError(err, t.toastExportFailed);
        } finally {
          setBusy(false);
          setBusyLabel(undefined);
        }
      },
    });
  }, [auth.accessToken, handleApiError, mindMap, originalTitle, showToast, t]);

  // Cmd/Ctrl+S -> export, Cmd/Ctrl+R -> import. Both just open the same
  // confirm modal the toolbar buttons do (never skip it) since both these
  // keys are often pressed out of habit (save / reload) and both actions
  // overwrite one side with the other.
  useEffect(() => {
    function handleSaveOrImportShortcut(e: KeyboardEvent) {
      if (!(e.ctrlKey || e.metaKey)) return;
      const key = e.key.toLowerCase();
      if (key === "s") {
        e.preventDefault();
        handleExportClick();
      } else if (key === "r") {
        e.preventDefault();
        handleImportClick();
      }
    }
    window.addEventListener("keydown", handleSaveOrImportShortcut);
    return () => window.removeEventListener("keydown", handleSaveOrImportShortcut);
  }, [handleExportClick, handleImportClick]);

  const selectedNode = mindMap ? findSelectedNode(mindMap, selection) : null;

  const handleRootTitleChange = useCallback(
    (title: string) => {
      if (!mindMap) return;
      commitMindMap({ ...mindMap, title });
    },
    [mindMap, commitMindMap],
  );

  const handleSelectedTitleChange = useCallback(
    (title: string) => {
      if (!mindMap || !selection || selection.depth === 0) return;
      const next =
        selection.depth === 1
          ? updateTaskNode(mindMap, selection.nodeId, { title })
          : updateLeafNode(mindMap, selection.parentId, selection.nodeId, { title });
      commitMindMap(next);
    },
    [mindMap, selection, commitMindMap],
  );

  // shared by the canvas (hover buttons + keyboard) and, on mobile, the
  // properties sheet's own add/delete buttons (see PropertiesPanel.tsx —
  // the sheet covers the canvas's floating buttons there, so it needs its
  // own reliable path to the same actions)
  const handleAddTaskNode = useCallback((): string => {
    if (!mindMap) return "";
    const { mindMap: next, nodeId } = addTaskNode(mindMap, t.newTaskDefault);
    commitMindMap(next, { immediate: true });
    setSelection({ depth: 1, nodeId });
    return nodeId;
  }, [mindMap, commitMindMap, t]);

  const handleAddLeafNode = useCallback(
    (parentId: string): string => {
      if (!mindMap) return "";
      const { mindMap: next, nodeId } = addLeafNode(mindMap, parentId, t.newSubtaskDefault);
      commitMindMap(next, { immediate: true });
      setSelection({ depth: 2, nodeId, parentId });
      return nodeId;
    },
    [mindMap, commitMindMap, t],
  );

  const handleDeleteTaskNode = useCallback(
    (nodeId: string) => {
      if (!mindMap) return;
      if (selection?.depth === 1 && selection.nodeId === nodeId) {
        setSelection(getPostDeleteSelection(mindMap, selection));
      }
      commitMindMap(removeTaskNode(mindMap, nodeId), { immediate: true });
    },
    [mindMap, selection, commitMindMap],
  );

  const handleDeleteLeafNode = useCallback(
    (parentId: string, nodeId: string) => {
      if (!mindMap) return;
      if (selection?.depth === 2 && selection.nodeId === nodeId) {
        setSelection(getPostDeleteSelection(mindMap, selection));
      }
      commitMindMap(removeLeafNode(mindMap, parentId, nodeId), { immediate: true });
    },
    [mindMap, selection, commitMindMap],
  );

  // depth-aware add/delete for the properties panel's own buttons (mobile)
  const propertiesOnAddChild = !selection
    ? undefined
    : selection.depth === 0
      ? () => handleAddTaskNode()
      : selection.depth === 1
        ? () => handleAddLeafNode(selection.nodeId)
        : undefined;

  const propertiesOnDelete = !selection
    ? undefined
    : selection.depth === 1
      ? () => handleDeleteTaskNode(selection.nodeId)
      : selection.depth === 2
        ? () => handleDeleteLeafNode(selection.parentId, selection.nodeId)
        : undefined;

  // On mobile, auto-open properties bottom sheet when a node is selected
  const prevSelectionRef = useRef<Selection>(null);
  useEffect(() => {
    const prev = prevSelectionRef.current;
    prevSelectionRef.current = selection;
    if (isMobile && selection && selection !== prev) {
      setPropertiesOpen(true);
    }
  }, [selection, isMobile]);

  if (!auth.accessToken) {
    return (
      <LoginScreen
        isReady={auth.isReady}
        hasClientId={auth.hasClientId}
        expired={auth.expired}
        authError={auth.authError}
        onSignIn={auth.signIn}
      />
    );
  }

  return (
    <div className="relative flex flex-1 overflow-hidden">
      {/* Sidebar backdrop (mobile only) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Bottom-sheet backdrop (mobile only) */}
      {propertiesOpen && isMobile && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 md:hidden"
          onClick={() => setPropertiesOpen(false)}
        />
      )}
      <Sidebar
        taskLists={taskLists}
        selectedTaskListId={selectedTaskListId}
        onSelect={handleSelectTaskList}
        onCreate={handleCreateTaskList}
        onDelete={handleDeleteTaskList}
        busy={busy}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {mindMap ? (
        <div className="flex flex-1 flex-col overflow-hidden">
          <Toolbar
            onImportClick={handleImportClick}
            onExportClick={handleExportClick}
            showCompleted={showCompleted}
            onToggleShowCompleted={() => setShowCompleted((v) => !v)}
            disabled={busy}
            busy={busy}
            busyLabel={busyLabel}
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen((v) => !v)}
            propertiesOpen={propertiesOpen}
            onToggleProperties={() => setPropertiesOpen((v) => !v)}
          />
          <div className="flex flex-1 overflow-hidden">
            <MindMapCanvas
              mindMap={mindMap}
              selection={selection}
              showCompleted={showCompleted}
              onSelectRoot={() => setSelection({ depth: 0 })}
              onSelectTaskNode={(nodeId) => setSelection({ depth: 1, nodeId })}
              onSelectLeafNode={(nodeId, parentId) => setSelection({ depth: 2, nodeId, parentId })}
              onAddTaskNode={handleAddTaskNode}
              onAddLeafNode={handleAddLeafNode}
              onDeleteTaskNode={handleDeleteTaskNode}
              onDeleteLeafNode={handleDeleteLeafNode}
              onRootTitleChange={handleRootTitleChange}
              onTitleChange={handleSelectedTitleChange}
            />
            <PropertiesPanel
              selection={selection}
              rootTitle={mindMap.title}
              onAddChild={propertiesOnAddChild}
              onDelete={propertiesOnDelete}
              onRootTitleChange={handleRootTitleChange}
              selectedNode={selectedNode}
              onTitleChange={handleSelectedTitleChange}
              open={propertiesOpen}
              onClose={() => setPropertiesOpen(false)}
              onNotesChange={(notes) => {
                if (!mindMap || !selection || selection.depth === 0) return;
                const next =
                  selection.depth === 1
                    ? updateTaskNode(mindMap, selection.nodeId, { notes })
                    : updateLeafNode(mindMap, selection.parentId, selection.nodeId, { notes });
                commitMindMap(next);
              }}
              onDueChange={(due) => {
                if (!mindMap || !selection || selection.depth === 0) return;
                const next =
                  selection.depth === 1
                    ? updateTaskNode(mindMap, selection.nodeId, { due })
                    : updateLeafNode(mindMap, selection.parentId, selection.nodeId, { due });
                commitMindMap(next, { immediate: true });
              }}
              onStatusChange={(completed) => {
                if (!mindMap || !selection || selection.depth === 0) return;
                const status = completed ? "completed" : "needsAction";
                const next =
                  selection.depth === 1
                    ? updateTaskNode(mindMap, selection.nodeId, { status })
                    : updateLeafNode(mindMap, selection.parentId, selection.nodeId, { status });
                commitMindMap(next, { immediate: true });
              }}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center border-b border-slate-200 bg-white px-3 py-3 md:hidden">
            <button
              type="button"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label={t.toggleSidebar}
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100"
            >
              <PanelIcon side="left" />
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
            {t.emptyStateHint}
          </div>
        </div>
      )}

      {pendingAction && (
        <ConfirmModal
          title={pendingAction.title}
          message={pendingAction.message}
          confirmLabel={pendingAction.confirmLabel}
          onConfirm={pendingAction.onConfirm}
          onCancel={() => setPendingAction(null)}
        />
      )}
    </div>
  );
}
