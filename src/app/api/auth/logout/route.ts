import { NextResponse, type NextRequest } from "next/server";
import { getServerEnv } from "@/lib/server/env";
import { decrypt } from "@/lib/server/crypto";
import { clearRefreshTokenCookie, getRefreshTokenCookie } from "@/lib/server/cookies";
import { revokeToken } from "@/lib/server/google";
import { isSameOrigin } from "@/lib/server/csrf";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const { appUrl } = getServerEnv();

  if (!isSameOrigin(request, appUrl)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const encryptedRefreshToken = await getRefreshTokenCookie();
  if (encryptedRefreshToken) {
    const refreshToken = decrypt(encryptedRefreshToken);
    if (refreshToken) await revokeToken(refreshToken);
  }
  await clearRefreshTokenCookie();

  return new NextResponse(null, { status: 204 });
}
