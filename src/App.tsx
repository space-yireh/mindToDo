import { useCallback } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type OnConnect,
  BackgroundVariant,
} from '@xyflow/react'

import type { MindNode, MindEdge } from '@/types'
import MindMapNode from '@/components/mindmap/MindMapNode'

// 커스텀 노드 타입 등록
const nodeTypes = {
  mindNode: MindMapNode,
}

// 초기 루트 노드
const initialNodes: MindNode[] = [
  {
    id: 'root',
    type: 'mindNode',
    position: { x: 0, y: 0 },
    data: { label: '새 프로젝트', depth: 0 },
  },
]

const initialEdges: MindEdge[] = []

export default function App() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  )

  return (
    <div className="w-screen h-screen bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  )
}
