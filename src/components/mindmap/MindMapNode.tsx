import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { cn } from '@/lib/utils'
import type { MindNode } from '@/types'

/**
 * mindToDo 마인드맵 커스텀 노드
 * shadcn/ui 디자인 시스템(CSS 변수)을 따르며,
 * depth에 따라 시각적 스타일이 달라집니다.
 */
const MindMapNode = memo(({ data, selected }: NodeProps<MindNode>) => {
  const isRoot = data.depth === 0

  return (
    <div
      className={cn(
        'relative px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 cursor-pointer select-none',
        'bg-card text-card-foreground shadow-sm',
        isRoot
          ? 'px-6 py-3 text-base font-semibold bg-primary text-primary-foreground border-primary shadow-md'
          : 'hover:shadow-md hover:border-ring',
        selected && 'ring-2 ring-ring ring-offset-2 ring-offset-background',
      )}
    >
      {/* 부모로부터 들어오는 연결 핸들 (루트 제외) */}
      {!isRoot && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-2 !h-2 !bg-muted-foreground !border-0"
        />
      )}

      <span>{data.label}</span>

      {/* 자식 노드로 나가는 연결 핸들 */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-muted-foreground !border-0"
      />
    </div>
  )
})

MindMapNode.displayName = 'MindMapNode'

export default MindMapNode
