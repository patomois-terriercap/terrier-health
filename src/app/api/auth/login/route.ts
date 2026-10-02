import { NextResponse } from "next/server";
import { buildAuthUrl } from "@/lib/google-oauth";
import { getSession, isConfigured } from "@/lib/session";

export async function GET() {
  if (!isConfigured()) {
    return NextResponse.json(
      { error: "Sign-in is not configured on this deployment (missing Google credentials, or DEMO_ONLY is set)." },
      { status: 500 },
    );
  }
  const session = await getSession();
  session.oauthState = crypto.randomUUID();
  await session.save();
  return NextResponse.redirect(buildAuthUrl(session.oauthState));
}
