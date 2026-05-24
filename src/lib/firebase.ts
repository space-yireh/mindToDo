import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

/**
 * Google Tasks API 호출 권한을 포함한 GoogleAuthProvider.
 * signInWithPopup 시 Tasks 스코프를 함께 요청합니다.
 */
export const googleProvider = new GoogleAuthProvider()
googleProvider.addScope('https://www.googleapis.com/auth/tasks')
googleProvider.setCustomParameters({ prompt: 'consent' })
