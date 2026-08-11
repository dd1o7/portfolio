import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions } from "@/lib/auth";
import { clearRateLimit, rateLimit, verifyPassword } from "@/lib/password";

// scrypt needs the Node runtime — it is unavailable on the Edge runtime.
export const runtime = "nodejs";

function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  if (!process.env.ADMIN_PASSWORD_HASH || !process.env.AUTH_SECRET) {
    return NextResponse.json(
      { error: "Admin is not configured on this deployment. Run `pnpm setup`." },
      { status: 503 },
    );
  }

  const ip = clientIp(request);
  const limit = rateLimit(ip);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${Math.ceil(limit.retryAfterSec / 60)} minutes.` },
      { status: 429 },
    );
  }

  let password: unknown;
  try {
    ({ password } = await request.json());
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  if (typeof password !== "string" || password.length === 0) {
    return NextResponse.json({ error: "Enter your password." }, { status: 400 });
  }

  if (!(await verifyPassword(password))) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  clearRateLimit(ip);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, await createSessionToken(), sessionCookieOptions);
  return response;
}
