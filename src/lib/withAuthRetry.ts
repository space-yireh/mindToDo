import { GoogleTasksApiError } from "./googleTasksApi";

/**
 * Wraps a Google Tasks API call with the "refresh once, retry once" policy
 * from the server-auth spec: if `call` 401s, `refresh` is invoked to get a
 * fresh access token and `call` is retried exactly once with it. If
 * `refresh` can't produce a token (the user is genuinely logged out —
 * `refresh` has already updated auth state for that by the time it
 * resolves), the original 401 propagates to the caller unchanged.
 */
export async function withAuthRetry<T>(
  accessToken: string,
  call: (token: string) => Promise<T>,
  refresh: () => Promise<string | null>,
): Promise<T> {
  try {
    return await call(accessToken);
  } catch (err) {
    if (err instanceof GoogleTasksApiError && err.status === 401) {
      const refreshed = await refresh();
      if (refreshed) {
        return call(refreshed);
      }
    }
    throw err;
  }
}
