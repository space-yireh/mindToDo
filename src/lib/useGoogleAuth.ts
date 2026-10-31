"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

// Refreshes 5 minutes before expiry, so a near-boundary API call doesn't
// race an in-flight refresh. Access tokens are short-lived (Google issues
// ~1h), so this still leaves a comfortable margin either way.
const REFRESH_MARGIN_SECONDS = 300;
const MIN_REFRESH_DELAY_MS = 5000;

type TokenResult =
  | { accessToken: string; expiresIn: number }
  | { error: "login_required" | "transient" };

async function requestAccessToken(): Promise<TokenResult> {
  let res: Response;
  try {
    res = await fetch("/api/auth/token", { method: "POST" });
  } catch {
    // network failure before even reaching our own server — transient
    return { error: "transient" };
  }
  if (res.ok) {
    const body = (await res.json()) as { accessToken: string; expiresIn: number };
    return body;
  }
  if (res.status === 401) return { error: "login_required" };
  return { error: "transient" };
}

export function useGoogleAuth() {
  const { t } = useLanguage();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  // true once the initial "is there already a session?" check has
  // resolved (either way) — lets page.tsx avoid flashing the login screen
  // for a returning user while that first request is still in flight
  const [isReady, setIsReady] = useState(false);
  const [expired, setExpired] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const expiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // shared by every concurrent caller so a burst of simultaneous 401s
  // (e.g. several Google Tasks calls in flight at once) triggers exactly
  // one refresh, not one per caller
  const refreshInFlightRef = useRef<Promise<string | null> | null>(null);
  const wasLoggedInRef = useRef(false);
  // `refresh` and `scheduleRefresh` each need to call the other (refresh
  // schedules the next one; the timer calls refresh again), which can't be
  // expressed as two directly-referencing useCallbacks without a
  // temporal-dead-zone error. Routing the timer through a ref — updated
  // right after `refresh` is defined, dereferenced only once the timeout
  // actually fires — breaks that cycle without either function needing the
  // other in its own dependency array.
  const refreshRef = useRef<() => Promise<string | null>>(() => Promise.resolve(null));

  const scheduleRefresh = useCallback((expiresIn: number) => {
    if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
    const delay = Math.max((expiresIn - REFRESH_MARGIN_SECONDS) * 1000, MIN_REFRESH_DELAY_MS);
    expiryTimerRef.current = setTimeout(() => {
      void refreshRef.current();
    }, delay);
  }, []);

  const refresh = useCallback(async (): Promise<string | null> => {
    if (refreshInFlightRef.current) return refreshInFlightRef.current;

    const promise = (async () => {
      const result = await requestAccessToken();
      if ("accessToken" in result) {
        setAccessToken(result.accessToken);
        setExpired(false);
        wasLoggedInRef.current = true;
        scheduleRefresh(result.expiresIn);
        return result.accessToken;
      }
      if (result.error === "login_required") {
        if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
        setAccessToken(null);
        // only show "session expired" copy if we actually had a session —
        // a first-time visitor just sees the plain login screen, not an
        // "expired" message for a session that never existed
        if (wasLoggedInRef.current) setExpired(true);
        wasLoggedInRef.current = false;
        return null;
      }
      // transient: leave accessToken/expired/wasLoggedInRef untouched —
      // this is a retry-later failure, not a logout
      return null;
    })();

    refreshInFlightRef.current = promise;
    try {
      return await promise;
    } finally {
      refreshInFlightRef.current = null;
    }
  }, [scheduleRefresh]);

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  // initial check on mount: do we already have a valid refresh-token cookie?
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await refresh();
      if (!cancelled) setIsReady(true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // re-check when the tab comes back into focus — a backgrounded tab's
  // setTimeout can be throttled/paused by the browser, so the token may
  // have silently expired while away
  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "visible") void refresh();
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [refresh]);

  useEffect(() => {
    return () => {
      if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
    };
  }, []);

  // one-time: read `?auth_error=cancelled|failed` from the OAuth redirect
  // (callback/route.ts), show the matching message, then strip it from the
  // URL so a refresh doesn't re-show it
  useEffect(() => {
    const url = new URL(window.location.href);
    const err = url.searchParams.get("auth_error");
    if (!err) return;
    // deliberately diverging from this effect's SSR-safe initial render —
    // there is no server-rendered equivalent of this message to match in
    // the first place, this only ever runs client-side after a redirect
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuthError(err === "cancelled" ? t.loginCancelled : t.loginFailed);
    url.searchParams.delete("auth_error");
    window.history.replaceState({}, "", url.pathname + url.search + url.hash);
    // t is read once here deliberately — this fires at most once per page
    // load, well before a user would plausibly have switched languages
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = useCallback(() => {
    setAuthError(null);
    // A real full-page navigation, not client-side routing — this hits a
    // Route Handler that 302s to Google's own consent screen, not a
    // Next.js page, so useRouter()/redirect() don't apply here.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/api/auth/login";
  }, []);

  const signOut = useCallback(async () => {
    if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
    setAccessToken(null);
    setExpired(false);
    wasLoggedInRef.current = false;
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // best-effort — local state is already cleared either way
    }
  }, []);

  return {
    accessToken,
    isReady,
    expired,
    authError,
    signIn,
    signOut,
    /**
     * Call when a Google Tasks API request comes back 401 mid-session.
     * Refreshes (sharing an in-flight refresh with any concurrent caller)
     * and returns the new access token, or null if the session is truly
     * gone — callers use this to retry the failed request exactly once
     * (see `withAuthRetry`).
     */
    handleUnauthorized: refresh,
  };
}
