import { useEffect, useCallback } from 'react'

type MindMapKeyboardOptions = {
  getSelectedNodeId: () => string | null
  addChildNode: (parentId: string) => string
  addSiblingNode: (targetId: string) => string | null
  deleteNode: (nodeId: string) => void
  /** 새 노드 생성 후 포커스/편집 모드 진입 콜백 */
  onNodeCreated?: (nodeId: string) => void
}

/**
 * PRD 3.1 키보드 조작 구현:
 *  - Tab    : 선택 노드의 자식 노드 추가
 *  - Enter  : 선택 노드의 형제 노드 추가
 *  - Delete / Backspace : 선택 노드 및 하위 노드 삭제
 *
 * React Flow 캔버스가 포커스된 상태일 때만 동작합니다.
 */
export function useMindMapKeyboard({
  getSelectedNodeId,
  addChildNode,
  addSiblingNode,
  deleteNode,
  onNodeCreated,
}: MindMapKeyboardOptions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // 입력 필드에 포커스가 있으면 단축키 무시
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      const selectedId = getSelectedNodeId()
      if (!selectedId) return

      switch (e.key) {
        case 'Tab': {
          e.preventDefault()
          const newId = addChildNode(selectedId)
          onNodeCreated?.(newId)
          break
        }
        case 'Enter': {
          e.preventDefault()
          const newId = addSiblingNode(selectedId)
          if (newId) onNodeCreated?.(newId)
          break
        }
        case 'Delete':
        case 'Backspace': {
          // 루트 노드는 삭제 불가
          if (selectedId !== 'root') {
            e.preventDefault()
            deleteNode(selectedId)
          }
          break
        }
      }
    },
    [getSelectedNodeId, addChildNode, addSiblingNode, deleteNode, onNodeCreated],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
