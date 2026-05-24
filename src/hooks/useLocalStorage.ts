import { useState, useEffect } from 'react'

/**
 * LocalStorage에 값을 저장하고 불러오는 범용 훅.
 * 마인드맵 상태(MindMapState)를 실시간으로 보존하는 데 사용됩니다.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch (error) {
      console.warn(`[useLocalStorage] 키 "${key}" 읽기 실패:`, error)
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue))
    } catch (error) {
      console.warn(`[useLocalStorage] 키 "${key}" 저장 실패:`, error)
    }
  }, [key, storedValue])

  return [storedValue, setStoredValue] as const
}
