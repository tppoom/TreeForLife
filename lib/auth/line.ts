import crypto from "crypto";

export interface LineOauthParams {
  channelId: string;
  redirectUri: string;
  state: string;
  nonce: string;
  codeChallenge: string;
  botPrompt?: "normal" | "aggressive";
}

export function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export function generateCodeChallenge(verifier: string): string {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}

export function generateRandomToken(bytes = 16): string {
  return crypto.randomBytes(bytes).toString("hex");
}

export function buildLineAuthorizeUrl(params: LineOauthParams): string {
  const url = new URL("https://access.line.me/oauth2/v2.1/authorize");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", params.channelId);
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("state", params.state);
  url.searchParams.set("scope", "openid profile");
  url.searchParams.set("nonce", params.nonce);
  url.searchParams.set("code_challenge", params.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("bot_prompt", params.botPrompt || "aggressive");
  return url.toString();
}

export interface LineTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  id_token: string;
}

export async function exchangeLineCodeForTokens(opts: {
  code: string;
  redirectUri: string;
  codeVerifier: string;
  channelId: string;
  channelSecret: string;
}): Promise<LineTokenResponse> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: opts.code,
    redirect_uri: opts.redirectUri,
    client_id: opts.channelId,
    client_secret: opts.channelSecret,
    code_verifier: opts.codeVerifier,
  });

  const res = await fetch("https://api.line.me/oauth2/v2.1/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`LINE token exchange failed (${res.status}): ${errorText}`);
  }

  return (await res.json()) as LineTokenResponse;
}

export interface LineIdTokenProfile {
  sub: string;
  name: string;
  picture?: string;
}

export async function verifyLineIdToken(opts: {
  idToken: string;
  channelId: string;
  nonce: string;
}): Promise<LineIdTokenProfile> {
  const body = new URLSearchParams({
    id_token: opts.idToken,
    client_id: opts.channelId,
    nonce: opts.nonce,
  });

  const res = await fetch("https://api.line.me/oauth2/v2.1/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`LINE id_token verification failed (${res.status}): ${errorText}`);
  }

  return (await res.json()) as LineIdTokenProfile;
}
