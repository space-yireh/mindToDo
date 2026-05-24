import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

export function LoginPage() {
  const { signInWithGoogle, loading } = useAuth()

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-background gap-8 px-4">
      {/* 로고 */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
          <svg className="w-9 h-9 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="3" />
            <line x1="12" y1="2" x2="12" y2="6" />
            <line x1="12" y1="18" x2="12" y2="22" />
            <line x1="2" y1="12" x2="6" y2="12" />
            <line x1="18" y1="12" x2="22" y2="12" />
            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
            <line x1="19.07" y1="4.93" x2="16.24" y2="7.76" />
            <line x1="7.76" y1="16.24" x2="4.93" y2="19.07" />
          </svg>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">mindToDo</h1>
          <p className="text-sm text-muted-foreground mt-1">
            생각을 마인드맵으로, 실행은 Google Tasks로
          </p>
        </div>
      </div>

      {/* 로그인 카드 */}
      <div className="w-full max-w-sm border border-border rounded-xl bg-card p-6 shadow-sm flex flex-col gap-5">
        <div className="text-center">
          <h2 className="text-base font-semibold text-foreground">시작하기</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Google 계정으로 로그인하면 Google Tasks와 자동 연동됩니다.
          </p>
        </div>

        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className={cn(
            'flex items-center justify-center gap-3 w-full py-2.5 px-4 rounded-lg',
            'border border-border bg-background text-foreground text-sm font-medium',
            'hover:bg-accent hover:text-accent-foreground transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
        >
          {/* Google 로고 SVG */}
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {loading ? '연결 중...' : 'Google로 계속하기'}
        </button>

        <p className="text-center text-xs text-muted-foreground leading-relaxed">
          로그인 시 Google Tasks 접근 권한이 요청됩니다.
          <br />
          데이터는 브라우저 LocalStorage에만 저장됩니다.
        </p>
      </div>

      {/* 기능 소개 */}
      <div className="flex gap-6 text-center">
        {[
          { icon: '🗺️', title: '마인드맵', desc: '자유로운 시각적 사고' },
          { icon: '⌨️', title: '키보드 조작', desc: 'Tab/Enter/Delete' },
          { icon: '✅', title: 'Google Tasks', desc: '할 일로 바로 변환' },
        ].map((item) => (
          <div key={item.title} className="flex flex-col items-center gap-1 w-24">
            <span className="text-2xl">{item.icon}</span>
            <span className="text-xs font-medium text-foreground">{item.title}</span>
            <span className="text-xs text-muted-foreground">{item.desc}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
