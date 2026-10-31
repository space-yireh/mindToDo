// Server-only environment variables for the Authorization Code Flow (no
// NEXT_PUBLIC_ prefix — none of these may ever reach the client bundle).
// Validated lazily (on first use inside a route handler) rather than at
// module load time, so a missing var fails with a clear message from
// whichever request actually needed it instead of crashing the whole
// server process at boot.

export interface ServerEnv {
  googleClientId: string;
  googleClientSecret: string;
  /** raw base64 value, still base64 — decode + length-check happens in crypto.ts */
  authCookieSecret: string;
  /** canonical origin redirect_uri is built from — never the request's own Host header */
  appUrl: string;
}

let cached: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (cached) return cached;

  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const authCookieSecret = process.env.AUTH_COOKIE_SECRET;
  const appUrl = process.env.APP_URL;

  const missing: string[] = [];
  if (!googleClientId) missing.push("GOOGLE_CLIENT_ID");
  if (!googleClientSecret) missing.push("GOOGLE_CLIENT_SECRET");
  if (!authCookieSecret) missing.push("AUTH_COOKIE_SECRET");
  if (!appUrl) missing.push("APP_URL");
  if (missing.length > 0) {
    throw new Error(
      `Missing required server environment variable(s): ${missing.join(", ")}. ` +
        "See .env.example.",
    );
  }

  cached = {
    googleClientId: googleClientId!,
    googleClientSecret: googleClientSecret!,
    authCookieSecret: authCookieSecret!,
    // strip a trailing slash so `${appUrl}/api/auth/callback` never ends up with `//`
    appUrl: appUrl!.replace(/\/+$/, ""),
  };
  return cached;
}
