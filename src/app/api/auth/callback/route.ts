import { NextResponse, type NextRequest } from "next/server";
import { appUrl, exchangeCode } from "@/lib/google-oauth";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const fail = (msg: string) =>
    NextResponse.redirect(`${appUrl()}/?error=${encodeURIComponent(msg)}`);

  const error = params.get("error");
  if (error) return fail(error);

  const session = await getSession();
  const code = params.get("code");
  if (!code || !params.get("state") || params.get("state") !== session.oauthState) {
    return fail("Sign-in state mismatch, please try again");
  }

  try {
    const tokens = await exchangeCode(code);
    session.accessToken = tokens.access_token;
    session.expiresAt = Date.now() + tokens.expires_in * 1000;
    if (tokens.refresh_token) session.refreshToken = tokens.refresh_token;
    session.oauthState = undefined;
    await session.save();
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Token exchange failed");
  }
  return NextResponse.redirect(`${appUrl()}/`);
}
