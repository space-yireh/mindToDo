import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * shadcn/ui 표준 cn 유틸리티
 * clsx로 조건부 클래스를 처리하고, tailwind-merge로 충돌하는 Tailwind 클래스를 병합합니다.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
