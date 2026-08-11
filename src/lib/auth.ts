/**
 * Session cookies — safe to import anywhere, including middleware.
 *
 * This file must stay free of Node built-ins. Middleware runs in the Edge
 * runtime, and the bundler traces every import: a single reference to
 * `node:crypto` anywhere in this module's graph fails the build, even behind a
 * dynamic import. Password hashing therefore lives in `password.ts`, which only
 * Node-runtime route handlers import.
 *
 * `jose` is used here because it is built on Web Crypto and works in both
 * runtimes.
 */

import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "portfolio_session";
const SESSION_HOURS = 12;

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set — run `pnpm setup`.");
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(secretKey());
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload.role === "admin";
  } catch {
    // Expired, tampered with, signed by a different secret, or AUTH_SECRET
    // is missing entirely. All of them mean "not signed in".
    return false;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: SESSION_HOURS * 60 * 60,
};
