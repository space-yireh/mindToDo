import { Node, Edge } from '@xyflow/react'

// ─────────────────────────────────────────────
// 마인드맵 노드 타입
// ─────────────────────────────────────────────

export type MindNodeData = {
  label: string
  /** 노드의 깊이 (루트=0, Level1=1, ...) */
  depth: number
  /** 편집 모드 여부 */
  isEditing?: boolean
}

export type MindNode = Node<MindNodeData, 'mindNode'> & { selected: boolean }

export type MindEdge = Edge

// ─────────────────────────────────────────────
// 마인드맵 트리 (LocalStorage 저장 단위)
// ─────────────────────────────────────────────

export type MindMapState = {
  nodes: MindNode[]
  edges: MindEdge[]
}

// ─────────────────────────────────────────────
// Google Tasks 관련 타입
// ─────────────────────────────────────────────

export type GoogleTaskList = {
  id: string
  title: string
}

export type GoogleTask = {
  id: string
  title: string
  notes?: string
  status: 'needsAction' | 'completed'
  parent?: string
}

// ─────────────────────────────────────────────
// 인증 관련 타입
// ─────────────────────────────────────────────

export type AuthUser = {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
  /** Google Tasks API 호출용 Access Token */
  accessToken?: string
}
