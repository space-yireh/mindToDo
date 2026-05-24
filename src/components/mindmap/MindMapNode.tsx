import { memo, useState, useRef, useEffect } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { cn } from '@/lib/utils'
import type { MindNode } from '@/types'

type MindMapNodeEvents = {
  onLabelChange?: (id: string, label: string) => void
}

/**
 * mindToDo 마인드맵 커스텀 노드
 * - depth에 따라 루트/일반 노드 스타일 분기
 * - 더블클릭으로 인라인 편집 가능
 * - shadcn/ui CSS 변수 기반 다크모드 지원
 */
const MindMapNode = memo(
  ({ id, data, selected }: NodeProps<MindNode> & MindMapNodeEvents) => {
    const isRoot = data.depth === 0
    const [editing, setEditing] = useState(false)
    const [label, setLabel] = useState(data.label)
    const inputRef = useRef<HTMLInputElement>(null)

    // 외부에서 label이 변경되면 동기화
    useEffect(() => {
      setLabel(data.label)
    }, [data.label])

    // 편집 모드 진입 시 input 포커스
    useEffect(() => {
      if (editing) {
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }, [editing])

    const commitEdit = () => {
      setEditing(false)
      // App 레벨로 변경 이벤트 전파 (커스텀 이벤트)
      const trimmed = label.trim() || '새 항목'
      setLabel(trimmed)
      window.dispatchEvent(
        new CustomEvent('mindnode:labelchange', { detail: { id, label: trimmed } }),
      )
    }

    return (
      <div
        className={cn(
          'relative px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 select-none',
          'bg-card text-card-foreground shadow-sm',
          isRoot
            ? 'px-6 py-3 text-base font-semibold bg-primary text-primary-foreground border-primary shadow-md min-w-[120px]'
            : 'hover:shadow-md hover:border-ring min-w-[100px]',
          selected && !isRoot && 'ring-2 ring-ring ring-offset-2 ring-offset-background',
          selected && isRoot && 'ring-2 ring-primary/50 ring-offset-2',
        )}
        onDoubleClick={() => setEditing(true)}
      >
        {!isRoot && (
          <Handle
            type="target"
            position={Position.Left}
            className="!w-2 !h-2 !bg-muted-foreground !border-0"
          />
        )}

        {editing ? (
          <input
            ref={inputRef}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === 'Escape') commitEdit()
              e.stopPropagation() // React Flow 키 이벤트와 충돌 방지
            }}
            className={cn(
              'bg-transparent outline-none border-b border-current w-full',
              isRoot ? 'text-primary-foreground' : 'text-foreground',
            )}
          />
        ) : (
          <span>{label}</span>
        )}

        <Handle
          type="source"
          position={Position.Right}
          className="!w-2 !h-2 !bg-muted-foreground !border-0"
        />
      </div>
    )
  },
)

MindMapNode.displayName = 'MindMapNode'

export default MindMapNode
