import { NextResponse, type NextRequest } from "next/server";
import { exchangeLineCodeForTokens, verifyLineIdToken } from "@/lib/auth/line";
import {
  signSession,
  isValidRedirectPath,
  OAUTH_COOKIE_NAME,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { mergeGuestData } from "@/lib/services/gardenService";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const oauthCookie = req.cookies.get(OAUTH_COOKIE_NAME)?.value;

  if (!oauthCookie) {
    return NextResponse.json(
      { error: "Missing OAuth state cookie. Session may have expired." },
      { status: 400 }
    );
  }

  let oauthData: {
    state: string;
    nonce: string;
    codeVerifier: string;
    next: string;
    guestToken?: string | null;
  };

  try {
    oauthData = JSON.parse(oauthCookie);
  } catch {
    return NextResponse.json({ error: "Malformed OAuth cookie." }, { status: 400 });
  }

  const nextPath = isValidRedirectPath(oauthData.next) ? oauthData.next : "/today";

  // Check if user cancelled authorization
  const error = searchParams.get("error");
  if (error) {
    const cancelRes = NextResponse.redirect(
      new URL(`${nextPath}?auth=cancelled`, req.nextUrl.origin)
    );
    cancelRes.cookies.delete(OAUTH_COOKIE_NAME);
    return cancelRes;
  }

  const state = searchParams.get("state");
  const code = searchParams.get("code");

  if (!state || state !== oauthData.state) {
    return NextResponse.json({ error: "OAuth state mismatch." }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: "Missing authorization code." }, { status: 400 });
  }

  const channelId = process.env.LINE_LOGIN_CHANNEL_ID || "mock-line-channel-id";
  const channelSecret = process.env.LINE_LOGIN_CHANNEL_SECRET || "mock-line-channel-secret";
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    req.nextUrl.origin ||
    "http://localhost:3000";
  const redirectUri = `${siteUrl.replace(/\/$/, "")}/api/auth/line/callback`;

  let lineUserId: string;
  let displayName: string;
  let avatarUrl: string | undefined;

  try {
    const tokenRes = await exchangeLineCodeForTokens({
      code,
      redirectUri,
      codeVerifier: oauthData.codeVerifier,
      channelId,
      channelSecret,
    });

    const profile = await verifyLineIdToken({
      idToken: tokenRes.id_token,
      channelId,
      nonce: oauthData.nonce,
    });

    lineUserId = profile.sub;
    displayName = profile.name;
    avatarUrl = profile.picture;
  } catch (err: unknown) {
    console.error("LINE OAuth exchange error:", err);
    return NextResponse.json(
      { error: "Failed to authenticate with LINE." },
      { status: 502 }
    );
  }

  const db = await getDb();
  let user: {
    id: string;
    role: "customer" | "staff" | "admin";
    sessionVersion: number;
    displayName: string;
  };

  const [existingUser] = await db
    .select({
      id: users.id,
      role: users.role,
      sessionVersion: users.sessionVersion,
      displayName: users.displayName,
    })
    .from(users)
    .where(eq(users.lineUserId, lineUserId))
    .limit(1);

  if (existingUser) {
    await db
      .update(users)
      .set({
        displayName,
        avatarUrl: avatarUrl || undefined,
        lastSeenAt: new Date(),
      })
      .where(eq(users.id, existingUser.id));

    user = {
      id: existingUser.id,
      role: existingUser.role as "customer" | "staff" | "admin",
      sessionVersion: existingUser.sessionVersion,
      displayName,
    };
  } else {
    const [newUser] = await db
      .insert(users)
      .values({
        displayName,
        lineUserId,
        avatarUrl: avatarUrl || null,
        role: "customer",
        sessionVersion: 1,
      })
      .returning();

    user = {
      id: newUser.id,
      role: newUser.role as "customer" | "staff" | "admin",
      sessionVersion: newUser.sessionVersion,
      displayName: newUser.displayName,
    };
  }

  // Merge guest data if guestToken was associated
  let mergedCount = 0;
  if (oauthData.guestToken) {
    try {
      const mergeRes = await mergeGuestData(oauthData.guestToken, user.id);
      mergedCount = mergeRes.plantCount;
    } catch (mergeErr) {
      console.error("Guest merge during login failed:", mergeErr);
    }
  }

  const sessionToken = await signSession({
    sub: user.id,
    role: user.role,
    sv: user.sessionVersion,
  });

  const redirectUrl = new URL(nextPath, req.nextUrl.origin);
  if (mergedCount > 0) {
    redirectUrl.searchParams.set("merged", String(mergedCount));
  }

  const res = NextResponse.redirect(redirectUrl);
  res.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 90 * 24 * 60 * 60, // 90 days
  });
  res.cookies.delete(OAUTH_COOKIE_NAME);

  return res;
}
