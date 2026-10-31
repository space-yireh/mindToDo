import type { NextRequest } from "next/server";

/**
 * State-changing routes (`/api/auth/token`, `/api/auth/logout`) are
 * cookie-authenticated POSTs, so they need their own CSRF defense — a
 * malicious page could otherwise issue the same request and ride the
 * user's cookie. Requires a same-origin `Origin` header; missing or
 * mismatched is rejected. (Plain top-level navigations, like the GET
 * redirects in login/callback, don't carry a comparable `Origin` the same
 * way and aren't state-changing on their own, so they're not covered by
 * this check.)
 */
export function isSameOrigin(request: NextRequest, appUrl: string): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(appUrl).origin;
  } catch {
    return false;
  }
}
