import { cookies } from "next/headers";

export const REFRESH_TOKEN_COOKIE = "mt_rt";
export const OAUTH_STATE_COOKIE = "mt_oauth_state";

const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;
const TEN_MINUTES_SECONDS = 60 * 10;

function baseOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/api/auth",
  };
}

export async function setRefreshTokenCookie(encryptedValue: string): Promise<void> {
  const store = await cookies();
  store.set(REFRESH_TOKEN_COOKIE, encryptedValue, {
    ...baseOptions(),
    maxAge: THIRTY_DAYS_SECONDS,
  });
}

export async function getRefreshTokenCookie(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(REFRESH_TOKEN_COOKIE)?.value;
}

// `.set(name, "", { maxAge: 0 })` instead of `.delete(name)` — deletion
// must specify the same `path` the cookie was set with (default path is
// "/", but these are scoped to "/api/auth"), and `.set` with the full
// options object is the unambiguous way to guarantee that match.
export async function clearRefreshTokenCookie(): Promise<void> {
  const store = await cookies();
  store.set(REFRESH_TOKEN_COOKIE, "", { ...baseOptions(), maxAge: 0 });
}

export async function setOAuthStateCookie(state: string): Promise<void> {
  const store = await cookies();
  store.set(OAUTH_STATE_COOKIE, state, {
    ...baseOptions(),
    maxAge: TEN_MINUTES_SECONDS,
  });
}

export async function getOAuthStateCookie(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(OAUTH_STATE_COOKIE)?.value;
}

export async function clearOAuthStateCookie(): Promise<void> {
  const store = await cookies();
  store.set(OAUTH_STATE_COOKIE, "", { ...baseOptions(), maxAge: 0 });
}
