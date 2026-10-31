import { getServerEnv } from "./env";

const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const REVOKE_ENDPOINT = "https://oauth2.googleapis.com/revoke";

interface GoogleErrorBody {
  error?: string;
  error_description?: string;
}

/**
 * Wraps a failed Google OAuth token-endpoint response. `status < 500`
 * (e.g. 400 `invalid_grant` — the refresh token was revoked, expired, or
 * never existed) means the failure is permanent for this refresh token;
 * `status >= 500` or a network-level failure (a plain TypeError from
 * `fetch`, not this class) means it's worth retrying later.
 */
export class GoogleAuthError extends Error {
  status: number;
  code?: string;
  constructor(status: number, body: GoogleErrorBody) {
    super(body.error_description ?? body.error ?? `Google auth request failed (${status})`);
    this.name = "GoogleAuthError";
    this.status = status;
    this.code = body.error;
  }
}

export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
}

async function parseErrorBody(res: Response): Promise<GoogleErrorBody> {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

async function postForm(params: Record<string, string>): Promise<GoogleTokenResponse> {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params),
  });
  if (!res.ok) {
    throw new GoogleAuthError(res.status, await parseErrorBody(res));
  }
  return res.json();
}

export function exchangeCodeForTokens(code: string): Promise<GoogleTokenResponse> {
  const { googleClientId, googleClientSecret, appUrl } = getServerEnv();
  return postForm({
    code,
    client_id: googleClientId,
    client_secret: googleClientSecret,
    redirect_uri: `${appUrl}/api/auth/callback`,
    grant_type: "authorization_code",
  });
}

export function refreshAccessToken(refreshToken: string): Promise<GoogleTokenResponse> {
  const { googleClientId, googleClientSecret } = getServerEnv();
  return postForm({
    refresh_token: refreshToken,
    client_id: googleClientId,
    client_secret: googleClientSecret,
    grant_type: "refresh_token",
  });
}

/** Best-effort — logout proceeds regardless of whether this succeeds. */
export async function revokeToken(token: string): Promise<void> {
  try {
    await fetch(REVOKE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token }),
    });
  } catch {
    // ignore — see above
  }
}
