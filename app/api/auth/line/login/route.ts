import { NextResponse, type NextRequest } from "next/server";
import {
  generateCodeVerifier,
  generateCodeChallenge,
  generateRandomToken,
  buildLineAuthorizeUrl,
} from "@/lib/auth/line";
import {
  isValidRedirectPath,
  OAUTH_COOKIE_NAME,
  GUEST_COOKIE_NAME,
} from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const requestedNext = searchParams.get("next");
  const next = isValidRedirectPath(requestedNext) ? requestedNext! : "/today";

  const guestToken =
    searchParams.get("guestToken") ||
    req.cookies.get(GUEST_COOKIE_NAME)?.value ||
    req.headers.get("x-guest-token") ||
    null;

  const state = generateRandomToken(16);
  const nonce = generateRandomToken(16);
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  const channelId = process.env.LINE_LOGIN_CHANNEL_ID || "mock-line-channel-id";
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    req.nextUrl.origin ||
    "http://localhost:3000";

  const redirectUri = `${siteUrl.replace(/\/$/, "")}/api/auth/line/callback`;

  const authorizeUrl = buildLineAuthorizeUrl({
    channelId,
    redirectUri,
    state,
    nonce,
    codeChallenge,
    botPrompt: "aggressive",
  });

  const oauthData = JSON.stringify({
    state,
    nonce,
    codeVerifier,
    next,
    guestToken,
  });

  const res = NextResponse.redirect(authorizeUrl);
  res.cookies.set(OAUTH_COOKIE_NAME, oauthData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 minutes
  });

  return res;
}
