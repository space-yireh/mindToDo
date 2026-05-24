import { useCallback } from 'react'
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from '@xyflow/react'
import { useLocalStorage } from './useLocalStorage'
import type { MindNode, MindEdge, MindMapState } from '@/types'

const STORAGE_KEY = 'mindtodo-mindmap'

/** 루트 노드 초기값 */
const DEFAULT_STATE: MindMapState = {
  nodes: [
    {
      id: 'root',
      type: 'mindNode',
      position: { x: 0, y: 0 },
      data: { label: '새 프로젝트', depth: 0 },
      selected: false,
    },
  ],
  edges: [],
}

/**
 * 마인드맵 전체 상태(노드/엣지)를 관리하는 핵심 훅.
 * - LocalStorage 자동 저장/복원
 * - 노드 추가 (자식/형제)
 * - 노드 삭제 (하위 노드 포함 재귀 삭제)
 * - 노드 레이블 수정
 */
export function useMindMap() {
  const [state, setState] = useLocalStorage<MindMapState>(STORAGE_KEY, DEFAULT_STATE)

  const nodes = state.nodes
  const edges = state.edges

  // ─── React Flow 기본 핸들러 ────────────────────────────────
  const onNodesChange = useCallback(
    (changes: NodeChange<MindNode>[]) =>
      setState((s) => ({
        ...s,
        nodes: applyNodeChanges(changes, s.nodes) as MindNode[],
      })),
    [setState],
  )

  const onEdgesChange = useCallback(
    (changes: EdgeChange<MindEdge>[]) =>
      setState((s) => ({
        ...s,
        edges: applyEdgeChanges(changes, s.edges) as MindEdge[],
      })),
    [setState],
  )

  const onConnect = useCallback(
    (connection: Connection) =>
      setState((s) => ({
        ...s,
        edges: addEdge(connection, s.edges) as MindEdge[],
      })),
    [setState],
  )

  // ─── 노드 유틸리티 ────────────────────────────────────────

  /** 특정 노드의 모든 하위 자손 ID를 재귀적으로 수집 */
  const getDescendantIds = useCallback(
    (nodeId: string, currentEdges: MindEdge[]): string[] => {
      const childIds = currentEdges
        .filter((e) => e.source === nodeId)
        .map((e) => e.target)
      return childIds.flatMap((id) => [id, ...getDescendantIds(id, currentEdges)])
    },
    [],
  )

  /** 현재 선택된 노드의 자식 노드 위치 계산 (우측 아래 배치) */
  const calcChildPosition = useCallback(
    (parentNode: MindNode, siblingCount: number) => ({
      x: parentNode.position.x + 220,
      y: parentNode.position.y + siblingCount * 60,
    }),
    [],
  )

  /** 현재 선택된 노드의 형제 노드 위치 계산 (아래쪽 배치) */
  const calcSiblingPosition = useCallback((targetNode: MindNode) => ({
    x: targetNode.position.x,
    y: targetNode.position.y + 60,
  }), [])

  // ─── 노드 추가 ─────────────────────────────────────────────

  /**
   * 자식 노드 추가 (Tab 키)
   * @returns 새로 생성된 노드 ID
   */
  const addChildNode = useCallback(
    (parentId: string): string => {
      const newId = `node-${Date.now()}`
      setState((s) => {
        const parentNode = s.nodes.find((n) => n.id === parentId)
        if (!parentNode) return s

        const siblingCount = s.edges.filter((e) => e.source === parentId).length
        const newNode: MindNode = {
          id: newId,
          type: 'mindNode',
          position: calcChildPosition(parentNode, siblingCount),
          data: { label: '새 항목', depth: parentNode.data.depth + 1 },
          selected: true,
        }
        const newEdge: MindEdge = {
          id: `edge-${parentId}-${newId}`,
          source: parentId,
          target: newId,
          type: 'smoothstep',
        }
        return {
          nodes: [...s.nodes.map((n) => ({ ...n, selected: false as boolean })), newNode],
          edges: [...s.edges, newEdge],
        }
      })
      return newId
    },
    [setState, calcChildPosition],
  )

  /**
   * 형제 노드 추가 (Enter 키)
   * @returns 새로 생성된 노드 ID
   */
  const addSiblingNode = useCallback(
    (targetId: string): string | null => {
      const newId = `node-${Date.now()}`
      let created = false
      setState((s) => {
        const targetNode = s.nodes.find((n) => n.id === targetId)
        if (!targetNode || targetNode.id === 'root') return s

        // 부모 엣지 찾기
        const parentEdge = s.edges.find((e) => e.target === targetId)
        if (!parentEdge) return s

        const newNode: MindNode = {
          id: newId,
          type: 'mindNode',
          position: calcSiblingPosition(targetNode),
          data: { label: '새 항목', depth: targetNode.data.depth },
          selected: true,
        }
        const newEdge: MindEdge = {
          id: `edge-${parentEdge.source}-${newId}`,
          source: parentEdge.source,
          target: newId,
          type: 'smoothstep',
        }
        created = true
        return {
          nodes: [...s.nodes.map((n) => ({ ...n, selected: false as boolean })), newNode],
          edges: [...s.edges, newEdge],
        }
      })
      return created ? newId : null
    },
    [setState, calcSiblingPosition],
  )

  // ─── 노드 삭제 ─────────────────────────────────────────────

  /** 노드와 그 모든 하위 자손을 삭제 (Delete/Backspace 키) */
  const deleteNode = useCallback(
    (nodeId: string) => {
      if (nodeId === 'root') return // 루트 노드는 삭제 불가
      setState((s) => {
        const descendantIds = getDescendantIds(nodeId, s.edges)
        const toDelete = new Set([nodeId, ...descendantIds])
        return {
          nodes: s.nodes.filter((n) => !toDelete.has(n.id)),
          edges: s.edges.filter(
            (e) => !toDelete.has(e.source) && !toDelete.has(e.target),
          ),
        }
      })
    },
    [setState, getDescendantIds],
  )

  // ─── 노드 레이블 수정 ──────────────────────────────────────

  const updateNodeLabel = useCallback(
    (nodeId: string, label: string) => {
      setState((s) => ({
        ...s,
        nodes: s.nodes.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, label } } : n,
        ),
      }))
    },
    [setState],
  )

  // ─── 선택 노드 조회 ────────────────────────────────────────

  const getSelectedNodeId = useCallback(
    () => nodes.find((n) => n.selected)?.id ?? null,
    [nodes],
  )

  // ─── 상태 초기화 ────────────────────────────────────────────

  const resetMindMap = useCallback(() => {
    setState(DEFAULT_STATE)
  }, [setState])

  return {
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
  }
}
