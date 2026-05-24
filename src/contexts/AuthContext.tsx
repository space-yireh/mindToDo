import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'
import type { AuthUser } from '@/types'

// ─── Context 타입 ─────────────────────────────────────────

type AuthContextValue = {
  user: AuthUser | null
  /** Google OAuth Access Token (Tasks API 호출용) */
  accessToken: string | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Firebase Auth 상태 구독
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
        })
      } else {
        setUser(null)
        setAccessToken(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      // Google Access Token 추출 (Tasks API 호출에 사용)
      const credential = await result.user.getIdTokenResult()
      // OAuthCredential에서 accessToken 추출
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const oauthToken = (result as any)._tokenResponse?.oauthAccessToken as string | undefined
      if (oauthToken) setAccessToken(oauthToken)
      console.log('[Auth] Google 로그인 성공:', credential.claims.email)
    } catch (error) {
      console.error('[Auth] Google 로그인 실패:', error)
      throw error
    }
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
    setAccessToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.')
  return ctx
}
