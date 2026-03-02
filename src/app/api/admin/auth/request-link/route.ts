import { NextResponse } from "next/server";

import {
  buildAdminVerifyUrl,
  createMagicLinkToken,
  getClientIp,
  isAdminEmailAllowed,
  sendAdminMagicLinkEmail
} from "@/lib/admin-auth";

export const runtime = "nodejs";

type RateEntry = { count: number; resetAt: number };

const rateLimitWindowMs = 10 * 60 * 1000;
const rateLimitMax = 5;
const rateLimitStore = new Map<string, RateEntry>();

const isRateLimited = (key: string) => {
  const now = Date.now();
  const existing = rateLimitStore.get(key);
  if (!existing || existing.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + rateLimitWindowMs });
    return false;
  }
  if (existing.count >= rateLimitMax) return true;
  existing.count += 1;
  return false;
};

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as
    | { email?: string }
    | null;
  const rawEmail = payload?.email ?? "";
  const email = rawEmail.trim().toLowerCase();
  const ip = getClientIp(request);
  const rateKey = `${ip}:${email || "empty"}`;

  if (isRateLimited(rateKey)) {
    return NextResponse.json(
      { error: "Слишком много запросов. Попробуйте позже." },
      { status: 429 }
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: true });
  }

  try {
    if (isAdminEmailAllowed(email)) {
      const token = await createMagicLinkToken(email, ip);
      const link = buildAdminVerifyUrl(request, token);
      await sendAdminMagicLinkEmail(email, link);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Не удалось отправить ссылку. Попробуйте позже." },
      { status: 500 }
    );
  }
}
