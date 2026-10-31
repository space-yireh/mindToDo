import { NextResponse, type NextRequest } from "next/server";
import { getServerEnv } from "@/lib/server/env";
import { encrypt } from "@/lib/server/crypto";
import {
  clearOAuthStateCookie,
  getOAuthStateCookie,
  setRefreshTokenCookie,
} from "@/lib/server/cookies";
import { exchangeCodeForTokens } from "@/lib/server/google";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { appUrl } = getServerEnv();
  const params = request.nextUrl.searchParams;

  const savedState = await getOAuthStateCookie();
  await clearOAuthStateCookie();

  // user closed the consent popup / clicked "cancel" — Google reports this
  // as an `error` query param (commonly `access_denied`), not an HTTP error
  if (params.get("error")) {
    return NextResponse.redirect(`${appUrl}/?auth_error=cancelled`);
  }

  const state = params.get("state");
  const code = params.get("code");
  if (!state || !savedState || state !== savedState || !code) {
    return NextResponse.redirect(`${appUrl}/?auth_error=failed`);
  }

  const isConsentRetry = state.endsWith(".consent");

  try {
    const tokens = await exchangeCodeForTokens(code);

    if (!tokens.refresh_token) {
      // an already-consented account doesn't get a refresh_token back
      // unless the consent screen is forced — retry once with
      // prompt=consent; if *that* retry also comes back empty, stop
      // rather than loop
      if (isConsentRetry) {
        return NextResponse.redirect(`${appUrl}/?auth_error=failed`);
      }
      return NextResponse.redirect(`${appUrl}/api/auth/login?consent=1`);
    }

    await setRefreshTokenCookie(encrypt(tokens.refresh_token));
    return NextResponse.redirect(`${appUrl}/`);
  } catch {
    // never log the code/token values themselves
    return NextResponse.redirect(`${appUrl}/?auth_error=failed`);
  }
}
