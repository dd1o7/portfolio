/**
 * Password checking and login rate limiting.
 *
 * Node-only. Import this exclusively from route handlers that declare
 * `export const runtime = "nodejs"` — never from middleware or a component, or
 * the Edge bundle will fail to build. See the note in `auth.ts`.
 */

import "server-only";
import { scrypt, timingSafeEqual } from "node:crypto";

/** Check a password against the stored `salt:hash` produced by `pnpm setup`. */
export async function verifyPassword(password: string): Promise<boolean> {
  const stored = process.env.ADMIN_PASSWORD_HASH;
  if (!stored || !stored.includes(":")) return false;

  const [salt, expectedHex] = stored.split(":");
  const expected = Buffer.from(expectedHex, "hex");

  const actual = await new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, expected.length, (err, key) =>
      err ? reject(err) : resolve(key as Buffer),
    );
  });

  // Constant-time compare, so response timing does not leak how much of the
  // password was correct.
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/* ==========================================================================
   Login rate limiting
   ========================================================================== */

const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 10 * 60 * 1000;

/**
 * Crude in-memory rate limit.
 *
 * Serverless instances do not share memory, so this is a speed bump rather than
 * a guarantee. Still worth having: it stops a naive script, and scrypt's cost
 * already makes fast guessing impractical.
 */
export function rateLimit(ip: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const entry = attempts.get(ip);

  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterSec: 0 };
  }

  entry.count += 1;
  if (entry.count > MAX_ATTEMPTS) {
    return { allowed: false, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { allowed: true, retryAfterSec: 0 };
}

export function clearRateLimit(ip: string): void {
  attempts.delete(ip);
}
