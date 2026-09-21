"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@/components/Canvas";
import { ConfirmModal } from "@/components/ConfirmModal";
import { LoginScreen } from "@/components/LoginScreen";
import { PropertiesPanel } from "@/components/PropertiesPanel";
import { Sidebar } from "@/components/Sidebar";
import { Toolbar } from "@/components/Toolbar";
import { useToast } from "@/components/ToastProvider";
import {
  GoogleTasksApiError,
  createTaskList,
  deleteTaskList,
  listTaskLists,
} from "@/lib/googleTasksApi";
import { emptyMindMap } from "@/lib/mindmapConvert";
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

  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [selectedTaskListId, setSelectedTaskListId] = useState<string | null>(null);
  const [mindMap, setMindMap] = useState<MindMap | null>(null);
  const [originalTitle, setOriginalTitle] = useState<string>("");
  const [selection, setSelection] = useState<Selection>(null);
  const [showCompleted, setShowCompleted] = useState(true);
  const [busy, setBusy] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const wasSignedInRef = useRef(false);

  const handleApiError = useCallback(
    (err: unknown, fallbackMessage: string) => {
      if (err instanceof GoogleTasksApiError && err.status === 401) {
        auth.handleUnauthorized();
        showToast("세션이 만료되었습니다. 다시 로그인해주세요.", "error");
        return;
      }
      const message = err instanceof Error ? err.message : fallbackMessage;
      showToast(`${fallbackMessage}: ${message}`, "error");
    },
    [auth, showToast],
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
        if (!cancelled) handleApiError(err, "목록을 불러오지 못했습니다");
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
      try {
        const imported = await importMindMap(auth.accessToken, taskListId, taskListTitle);
        setMindMap(imported);
        setOriginalTitle(imported.title);
        setSelectedTaskListId(taskListId);
        setSelection(null);
        showToast("가져오기 완료", "success");
      } catch (err) {
        handleApiError(err, "가져오기 실패");
      } finally {
        setBusy(false);
      }
    },
    [auth.accessToken, handleApiError, showToast],
  );

  const handleSelectTaskList = useCallback(
    (taskListId: string) => {
      if (taskListId === selectedTaskListId || busy) return;
      const list = taskLists.find((t) => t.id === taskListId);
      void doImport(taskListId, list?.title ?? "");
    },
    [busy, doImport, selectedTaskListId, taskLists],
  );

  const handleCreateTaskList = useCallback(async () => {
    if (!auth.accessToken || busy) return;
    setBusy(true);
    try {
      const created = await createTaskList(auth.accessToken, "새 목록");
      setTaskLists((prev) => [...prev, { id: created.id, title: created.title }]);
      setSelectedTaskListId(created.id);
      setMindMap(emptyMindMap(created.id, created.title));
      setOriginalTitle(created.title);
      setSelection(null);
      showToast("새 목록을 만들었습니다", "success");
    } catch (err) {
      handleApiError(err, "목록 생성 실패");
    } finally {
      setBusy(false);
    }
  }, [auth.accessToken, busy, handleApiError, showToast]);

  const handleDeleteTaskList = useCallback(
    (taskListId: string) => {
      const list = taskLists.find((t) => t.id === taskListId);
      setPendingAction({
        title: "목록 삭제",
        message: `"${list?.title ?? ""}" 목록을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`,
        confirmLabel: "삭제",
        onConfirm: async () => {
          if (!auth.accessToken) return;
          setPendingAction(null);
          setBusy(true);
          try {
            await deleteTaskList(auth.accessToken, taskListId);
            setTaskLists((prev) => prev.filter((t) => t.id !== taskListId));
            if (taskListId === selectedTaskListId) {
              setSelectedTaskListId(null);
              setMindMap(null);
              setSelection(null);
            }
            showToast("목록을 삭제했습니다", "success");
          } catch (err) {
            handleApiError(err, "목록 삭제 실패");
          } finally {
            setBusy(false);
          }
        },
      });
    },
    [auth.accessToken, handleApiError, selectedTaskListId, showToast, taskLists],
  );

  const handleImportClick = useCallback(() => {
    if (!selectedTaskListId || !mindMap) return;
    setPendingAction({
      title: "가져오기",
      message:
        "Google Tasks의 최신 데이터를 불러옵니다.\n현재 마인드맵에 저장하지 않은 변경사항은 사라집니다.",
      confirmLabel: "가져오기",
      onConfirm: () => {
        setPendingAction(null);
        void doImport(selectedTaskListId, mindMap.title);
      },
    });
  }, [doImport, mindMap, selectedTaskListId]);

  const handleExportClick = useCallback(() => {
    if (!mindMap || !auth.accessToken) return;
    setPendingAction({
      title: "내보내기",
      message:
        "Google Tasks의 기존 할일을 모두 삭제하고\n현재 마인드맵 상태로 다시 생성합니다.\n완료 시각 등 기존 메타데이터는 초기화됩니다.",
      confirmLabel: "내보내기",
      onConfirm: async () => {
        setPendingAction(null);
        if (!mindMap || !auth.accessToken) return;
        setBusy(true);
        try {
          await exportMindMap(auth.accessToken, mindMap, originalTitle);
          setOriginalTitle(mindMap.title);
          setTaskLists((prev) =>
            prev.map((t) => (t.id === mindMap.taskListId ? { ...t, title: mindMap.title } : t)),
          );
          showToast("내보내기 완료", "success");
        } catch (err) {
          handleApiError(err, "내보내기 실패");
        } finally {
          setBusy(false);
        }
      },
    });
  }, [auth.accessToken, handleApiError, mindMap, originalTitle, showToast]);

  const selectedNode = mindMap ? findSelectedNode(mindMap, selection) : null;

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
    <div className="flex flex-1 overflow-hidden">
      <Sidebar
        taskLists={taskLists}
        selectedTaskListId={selectedTaskListId}
        onSelect={handleSelectTaskList}
        onCreate={handleCreateTaskList}
        onDelete={handleDeleteTaskList}
        busy={busy}
      />

      {mindMap ? (
        <div className="flex flex-1 flex-col overflow-hidden">
          <Toolbar
            onImportClick={handleImportClick}
            onExportClick={handleExportClick}
            showCompleted={showCompleted}
            onToggleShowCompleted={() => setShowCompleted((v) => !v)}
            disabled={busy}
          />
          <div className="flex flex-1 overflow-hidden">
            <Canvas
              mindMap={mindMap}
              selection={selection}
              showCompleted={showCompleted}
              onSelectRoot={() => setSelection({ depth: 0 })}
              onSelectTaskNode={(nodeId) => setSelection({ depth: 1, nodeId })}
              onSelectLeafNode={(nodeId, parentId) => setSelection({ depth: 2, nodeId, parentId })}
              onAddTaskNode={() => setMindMap((prev) => (prev ? addTaskNode(prev) : prev))}
              onAddLeafNode={(parentId) =>
                setMindMap((prev) => (prev ? addLeafNode(prev, parentId) : prev))
              }
              onDeleteTaskNode={(nodeId) => {
                setMindMap((prev) => (prev ? removeTaskNode(prev, nodeId) : prev));
                setSelection((prev) => (prev?.depth === 1 && prev.nodeId === nodeId ? null : prev));
              }}
              onDeleteLeafNode={(parentId, nodeId) => {
                setMindMap((prev) => (prev ? removeLeafNode(prev, parentId, nodeId) : prev));
                setSelection((prev) => (prev?.depth === 2 && prev.nodeId === nodeId ? null : prev));
              }}
            />
            <PropertiesPanel
              selection={selection}
              rootTitle={mindMap.title}
              onRootTitleChange={(title) => setMindMap((prev) => (prev ? { ...prev, title } : prev))}
              selectedNode={selectedNode}
              onTitleChange={(title) =>
                setMindMap((prev) => {
                  if (!prev || !selection || selection.depth === 0) return prev;
                  return selection.depth === 1
                    ? updateTaskNode(prev, selection.nodeId, { title })
                    : updateLeafNode(prev, selection.parentId, selection.nodeId, { title });
                })
              }
              onNotesChange={(notes) =>
                setMindMap((prev) => {
                  if (!prev || !selection || selection.depth === 0) return prev;
                  return selection.depth === 1
                    ? updateTaskNode(prev, selection.nodeId, { notes })
                    : updateLeafNode(prev, selection.parentId, selection.nodeId, { notes });
                })
              }
              onDueChange={(due) =>
                setMindMap((prev) => {
                  if (!prev || !selection || selection.depth === 0) return prev;
                  return selection.depth === 1
                    ? updateTaskNode(prev, selection.nodeId, { due })
                    : updateLeafNode(prev, selection.parentId, selection.nodeId, { due });
                })
              }
              onStatusChange={(completed) =>
                setMindMap((prev) => {
                  if (!prev || !selection || selection.depth === 0) return prev;
                  const status = completed ? "completed" : "needsAction";
                  return selection.depth === 1
                    ? updateTaskNode(prev, selection.nodeId, { status })
                    : updateLeafNode(prev, selection.parentId, selection.nodeId, { status });
                })
              }
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
          왼쪽에서 목록을 선택하거나 새로 만들어주세요.
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
