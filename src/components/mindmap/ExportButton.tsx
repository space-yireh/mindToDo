import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useMindMap } from '@/hooks/useMindMap'
import { exportToGoogleTasks } from '@/lib/googleTasks'
import { cn } from '@/lib/utils'

type ExportState = 'idle' | 'loading' | 'success' | 'error'

type ExportButtonProps = {
  nodes: ReturnType<typeof useMindMap>['nodes']
  edges: ReturnType<typeof useMindMap>['edges']
}

export function ExportButton({ nodes, edges }: ExportButtonProps) {
  const { accessToken } = useAuth()
  const [state, setState] = useState<ExportState>('idle')
  const [message, setMessage] = useState('')

  const handleExport = async () => {
    if (!accessToken) {
      setMessage('로그인이 필요합니다.')
      setState('error')
      return
    }

    setState('loading')
    setMessage('')

    try {
      const result = await exportToGoogleTasks(nodes, edges, accessToken)
      setMessage(`✓ "${result.taskListTitle}" — ${result.taskCount}개 할 일 동기화 완료`)
      setState('success')
      setTimeout(() => setState('idle'), 4000)
    } catch (err) {
      console.error('[Export] 실패:', err)
      setMessage('내보내기 실패. 콘솔을 확인하세요.')
      setState('error')
      setTimeout(() => setState('idle'), 4000)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {message && (
        <span
          className={cn(
            'text-xs px-2 py-1 rounded-md transition-all',
            state === 'success' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            state === 'error' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
          )}
        >
          {message}
        </span>
      )}
      <button
        onClick={handleExport}
        disabled={state === 'loading'}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium',
          'border border-border bg-card text-foreground',
          'hover:bg-accent hover:text-accent-foreground transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed',
        )}
      >
        {state === 'loading' ? (
          <>
            <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            동기화 중...
          </>
        ) : (
          <>
            {/* Google Tasks 아이콘 (체크박스 스타일) */}
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
            Google Tasks로 내보내기
          </>
        )}
      </button>
    </div>
  )
}
