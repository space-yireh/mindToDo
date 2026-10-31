import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { getServerEnv } from "./env";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

function getKey(): Buffer {
  const { authCookieSecret } = getServerEnv();
  const key = Buffer.from(authCookieSecret, "base64");
  if (key.length !== 32) {
    throw new Error(
      "AUTH_COOKIE_SECRET must be a base64-encoded 32-byte value (AES-256 key).",
    );
  }
  return key;
}

/** `iv.tag.ciphertext`, each segment base64url. */
export function encrypt(plain: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, ciphertext].map((buf) => buf.toString("base64url")).join(".");
}

/** Never throws — a malformed/tampered/wrong-key payload just returns null. */
export function decrypt(payload: string): string | null {
  try {
    const [ivPart, tagPart, ciphertextPart] = payload.split(".");
    if (!ivPart || !tagPart || !ciphertextPart) return null;
    const key = getKey();
    const iv = Buffer.from(ivPart, "base64url");
    const tag = Buffer.from(tagPart, "base64url");
    const ciphertext = Buffer.from(ciphertextPart, "base64url");
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return plain.toString("utf8");
  } catch {
    return null;
  }
}
