import { NextResponse, type NextRequest } from "next/server";
import { getServerEnv } from "@/lib/server/env";
import { decrypt, encrypt } from "@/lib/server/crypto";
import {
  clearRefreshTokenCookie,
  getRefreshTokenCookie,
  setRefreshTokenCookie,
} from "@/lib/server/cookies";
import { GoogleAuthError, refreshAccessToken } from "@/lib/server/google";
import { isSameOrigin } from "@/lib/server/csrf";

export const runtime = "nodejs";

const NO_STORE = { "Cache-Control": "no-store" };

export async function POST(request: NextRequest) {
  const { appUrl } = getServerEnv();

  if (!isSameOrigin(request, appUrl)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403, headers: NO_STORE });
  }

  const encryptedRefreshToken = await getRefreshTokenCookie();
  if (!encryptedRefreshToken) {
    return NextResponse.json({ error: "login_required" }, { status: 401, headers: NO_STORE });
  }

  const refreshToken = decrypt(encryptedRefreshToken);
  if (!refreshToken) {
    // tampered, corrupted, or encrypted under a since-rotated
    // AUTH_COOKIE_SECRET — there's nothing to recover, clear it
    await clearRefreshTokenCookie();
    return NextResponse.json({ error: "login_required" }, { status: 401, headers: NO_STORE });
  }

  try {
    const tokens = await refreshAccessToken(refreshToken);
    // Google rotates the refresh token on some responses; if it issued a
    // new one, store that instead of the one we sent. Re-setting the
    // cookie on every success is also what makes the 30-day lifetime
    // sliding, per spec.
    await setRefreshTokenCookie(encrypt(tokens.refresh_token ?? refreshToken));
    return NextResponse.json(
      { accessToken: tokens.access_token, expiresIn: tokens.expires_in },
      { headers: NO_STORE },
    );
  } catch (err) {
    if (err instanceof GoogleAuthError && err.status < 500) {
      // e.g. invalid_grant: the refresh token was revoked or expired —
      // permanent for this cookie, not worth retrying
      await clearRefreshTokenCookie();
      return NextResponse.json({ error: "login_required" }, { status: 401, headers: NO_STORE });
    }
    // network failure (fetch threw a plain TypeError, not GoogleAuthError)
    // or a 5xx from Google — leave the cookie alone, this is retryable
    return NextResponse.json({ error: "transient" }, { status: 503, headers: NO_STORE });
  }
}
