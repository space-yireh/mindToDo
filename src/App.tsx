import { useEffect, useCallback } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  ReactFlowProvider,
} from '@xyflow/react'
import { useAuth } from '@/contexts/AuthContext'
import { LoginPage } from '@/components/auth/LoginPage'
import MindMapNode from '@/components/mindmap/MindMapNode'
import { ExportButton } from '@/components/mindmap/ExportButton'
import { useMindMap } from '@/hooks/useMindMap'
import { useMindMapKeyboard } from '@/hooks/useMindMapKeyboard'

const nodeTypes = { mindNode: MindMapNode }

// ─── 마인드맵 캔버스 ──────────────────────────────────────

function MindMapCanvas() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addChildNode,
    addSiblingNode,
    deleteNode,
    updateNodeLabel,
    getSelectedNodeId,
    resetMindMap,
  } = useMindMap()
  const { user, signOut } = useAuth()

  // 더블클릭 인라인 편집 후 레이블 변경 수신
  const handleLabelChange = useCallback(
    (e: Event) => {
      const { id, label } = (e as CustomEvent<{ id: string; label: string }>).detail
      updateNodeLabel(id, label)
    },
    [updateNodeLabel],
  )

  useEffect(() => {
    window.addEventListener('mindnode:labelchange', handleLabelChange)
    return () => window.removeEventListener('mindnode:labelchange', handleLabelChange)
  }, [handleLabelChange])

  // PRD 3.1 키보드 단축키
  useMindMapKeyboard({
    getSelectedNodeId,
    addChildNode,
    addSiblingNode,
    deleteNode,
  })

  return (
    <div className="w-screen h-screen flex flex-col bg-background">
      {/* 헤더 */}
      <header className="h-12 flex items-center px-4 border-b border-border bg-card shrink-0 gap-3">
        {/* 로고 */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-bold">M</span>
          </div>
          <span className="text-sm font-semibold text-foreground tracking-tight">
            mindToDo
          </span>
        </div>

        <div className="flex-1" />

        {/* 키보드 힌트 */}
        <span className="text-xs text-muted-foreground hidden md:block">
          Tab: 자식&nbsp;·&nbsp;Enter: 형제&nbsp;·&nbsp;Delete: 삭제&nbsp;·&nbsp;더블클릭: 편집
        </span>

        <div className="flex-1 hidden md:block" />

        {/* 내보내기 + 사용자 */}
        <div className="flex items-center gap-3 shrink-0">
          <ExportButton nodes={nodes} edges={edges} />

          <div className="flex items-center gap-2">
            {user?.photoURL && (
              <img
                src={user.photoURL}
                alt={user.displayName ?? ''}
                className="w-6 h-6 rounded-full border border-border"
              />
            )}
            <button
              onClick={signOut}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              로그아웃
            </button>
          </div>

          <button
            onClick={resetMindMap}
            title="마인드맵 초기화"
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            초기화
          </button>
        </div>
      </header>

      {/* 마인드맵 캔버스 */}
      <main className="flex-1 overflow-hidden">
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.4 }}
            deleteKeyCode={null}
            className="bg-background"
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              className="opacity-40"
            />
            <Controls />
            <MiniMap
              nodeColor={(node) =>
                (node.data as { depth: number }).depth === 0
                  ? 'hsl(var(--primary))'
                  : 'hsl(var(--muted))'
              }
              className="!bg-card !border-border"
            />
          </ReactFlow>
        </ReactFlowProvider>
      </main>
    </div>
  )
}

// ─── 앱 루트 — 인증 상태에 따라 화면 분기 ─────────────────

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary animate-pulse" />
          <span className="text-sm text-muted-foreground">로딩 중...</span>
        </div>
      </div>
    )
  }

  return user ? <MindMapCanvas /> : <LoginPage />
}
