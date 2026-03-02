import { NextResponse } from "next/server";

import {
  consumeMagicLinkToken,
  getAdminSessionCookieName,
  issueAdminSessionToken
} from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  const email = await consumeMagicLinkToken(token);

  if (!email) {
    return NextResponse.redirect(new URL("/admin/login?error=invalid_link", url));
  }

  const sessionToken = issueAdminSessionToken(email);
  const response = NextResponse.redirect(new URL("/admin/blog", url));
  response.cookies.set({
    name: getAdminSessionCookieName(),
    value: sessionToken,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 12 * 60 * 60
  });
  return response;
}
