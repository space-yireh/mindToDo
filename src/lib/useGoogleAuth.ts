"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SCRIPT_SRC = "https://accounts.google.com/gsi/client";
const SCOPE = "https://www.googleapis.com/auth/tasks";

interface TokenResponse {
  access_token: string;
  expires_in: number;
  error?: string;
}

interface TokenClient {
  requestAccessToken: (opts?: { prompt?: string }) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: TokenResponse) => void;
          }) => TokenClient;
        };
      };
    };
  }
}

function loadGisScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Google Identity Services 스크립트 로드 실패")));
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Identity Services 스크립트 로드 실패"));
    document.head.appendChild(script);
  });
}

export function useGoogleAuth() {
  const [scriptReady, setScriptReady] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const tokenClientRef = useRef<TokenClient | null>(null);
  const expiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    let cancelled = false;
    loadGisScript()
      .then(() => {
        if (!cancelled) setScriptReady(true);
      })
      .catch((err: Error) => {
        if (!cancelled) setAuthError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!scriptReady || !clientId || !window.google) return;
    tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPE,
      callback: (response: TokenResponse) => {
        if (response.error || !response.access_token) {
          setAuthError("Google 로그인에 실패했습니다.");
          return;
        }
        setAccessToken(response.access_token);
        setExpired(false);
        setAuthError(null);

        if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
        expiryTimerRef.current = setTimeout(() => {
          setAccessToken(null);
          setExpired(true);
        }, response.expires_in * 1000);
      },
    });
  }, [scriptReady, clientId]);

  useEffect(() => {
    return () => {
      if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
    };
  }, []);

  const signIn = useCallback(() => {
    if (!tokenClientRef.current) {
      setAuthError("아직 로그인 준비가 되지 않았습니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    setAuthError(null);
    tokenClientRef.current.requestAccessToken({ prompt: expired ? "" : "consent" });
  }, [expired]);

  const signOut = useCallback(() => {
    if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
    setAccessToken(null);
    setExpired(false);
  }, []);

  return {
    accessToken,
    isReady: scriptReady && Boolean(clientId),
    hasClientId: Boolean(clientId),
    expired,
    authError,
    signIn,
    signOut,
    /** call when an API request comes back 401 mid-session */
    handleUnauthorized: useCallback(() => {
      if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
      setAccessToken(null);
      setExpired(true);
    }, []),
  };
}
