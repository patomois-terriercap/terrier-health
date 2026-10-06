import { NextResponse, type NextRequest } from "next/server";
import { demoDashboard } from "@/lib/demo";
import { ensureAccessToken } from "@/lib/google-oauth";
import { fetchDashboard } from "@/lib/health-api";
import { getSession, isConfigured } from "@/lib/session";
import { getPortalSession } from "@/lib/portal-session";

const RANGES = [7, 30, 90];

export async function GET(req: NextRequest) {
  const portalSession = await getPortalSession();

  if (portalSession.loggedIn !== true) {
    return NextResponse.json(
      { error: "portal_login_required" },
      { status: 401 },
    );
  }
  
  const requested = Number(req.nextUrl.searchParams.get("days"));
  const days = RANGES.includes(requested) ? requested : 30;

  if (req.nextUrl.searchParams.get("demo") === "1") {
    return NextResponse.json(demoDashboard(days));
  }
  if (!isConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 401 });
  }

  const session = await getSession();
  if (!session.refreshToken && !session.accessToken) {
    return NextResponse.json({ error: "not_signed_in" }, { status: 401 });
  }

  try {
    const token = await ensureAccessToken(session);
    await session.save(); // persist a refreshed token, if any
    return NextResponse.json(await fetchDashboard(token, days));
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    // A revoked/expired refresh token means the user has to sign in again.
    if (message.includes("invalid_grant") || message.includes("Not signed in")) {
      session.destroy();
      return NextResponse.json({ error: "not_signed_in" }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
