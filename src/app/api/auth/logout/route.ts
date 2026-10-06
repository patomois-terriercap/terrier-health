import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  getPortalSession,
  requirePortalSession,
} from "@/lib/portal-session";

export async function POST() {
  await requirePortalSession();

  const portalSession = await getPortalSession();
  portalSession.destroy();

  const healthSession = await getSession();
  healthSession.destroy();

  return NextResponse.redirect("https://terriercapital.cl/", {
    status: 303,
  });
}