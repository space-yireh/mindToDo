import { useEffect, useCallback } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  ReactFlowProvider,
} from '@xyflow/react'

import MindMapNode from '@/components/mindmap/MindMapNode'
import { useMindMap } from '@/hooks/useMindMap'
import { useMindMapKeyboard } from '@/hooks/useMindMapKeyboard'

const nodeTypes = { mindNode: MindMapNode }

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
  } = useMindMap()

  // 더블클릭 인라인 편집 후 레이블 변경 이벤트 수신
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

  // PRD 3.1 키보드 단축키 연결
  useMindMapKeyboard({
    getSelectedNodeId,
    addChildNode,
    addSiblingNode,
    deleteNode,
  })

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.4 }}
      deleteKeyCode={null} // 자체 Delete 핸들러 사용
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
  )
}

export default function App() {
  return (
    <div className="w-screen h-screen flex flex-col bg-background">
      {/* 헤더 */}
      <header className="h-12 flex items-center px-4 border-b border-border bg-card shrink-0 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-bold">M</span>
          </div>
          <span className="text-sm font-semibold text-foreground tracking-tight">
            mindToDo
          </span>
        </div>
        <div className="flex-1" />
        <span className="text-xs text-muted-foreground hidden sm:block">
          Tab: 자식 추가 &nbsp;·&nbsp; Enter: 형제 추가 &nbsp;·&nbsp; Delete: 삭제
          &nbsp;·&nbsp; 더블클릭: 편집
        </span>
      </header>

      {/* 마인드맵 캔버스 */}
      <main className="flex-1 overflow-hidden">
        <ReactFlowProvider>
          <MindMapCanvas />
        </ReactFlowProvider>
      </main>
    </div>
  )
}
