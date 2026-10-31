import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { getServerEnv } from "@/lib/server/env";
import { setOAuthStateCookie } from "@/lib/server/cookies";

export const runtime = "nodejs";

const SCOPE = "https://www.googleapis.com/auth/tasks";
const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";

export async function GET(request: NextRequest) {
  const { googleClientId, appUrl } = getServerEnv();

  // ?consent=1 is the one-time retry callback/route.ts issues when an
  // already-consented account doesn't hand back a refresh_token on the
  // first pass — forcing the consent screen is the only way Google will
  // re-issue one.
  const forceConsent = request.nextUrl.searchParams.get("consent") === "1";

  // the random half is the actual CSRF nonce; the `.consent` suffix just
  // lets callback/route.ts tell "this was already a consent retry" apart
  // from a first attempt, without a second cookie or query param to track
  const nonce = randomBytes(16).toString("base64url");
  const state = forceConsent ? `${nonce}.consent` : nonce;
  await setOAuthStateCookie(state);

  const params = new URLSearchParams({
    client_id: googleClientId,
    redirect_uri: `${appUrl}/api/auth/callback`,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    include_granted_scopes: "true",
    state,
  });
  if (forceConsent) params.set("prompt", "consent");

  return NextResponse.redirect(`${AUTH_ENDPOINT}?${params.toString()}`);
}
