import { NextResponse, type NextRequest } from "next/server";
import { demoDashboard } from "@/lib/demo";
import { getStoredAccessToken } from "@/lib/google-oauth";
import { fetchDashboard } from "@/lib/health-api";
import { isConfigured } from "@/lib/session";
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

  try {
    const token = await getStoredAccessToken();
    const dashboard = await fetchDashboard(token, days);

    return NextResponse.json(dashboard, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (
      message.includes("invalid_grant") ||
      message.includes("Not signed in")
    ) {
      return NextResponse.json(
        { error: "not_signed_in" },
        { status: 401 },
      );
    }

    console.error("Health dashboard request failed");

    return NextResponse.json(
      { error: "No se pudo cargar el dashboard." },
      { status: 500 },
    );
  }
}