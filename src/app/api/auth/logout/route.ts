import { NextResponse } from "next/server";
import { appUrl } from "@/lib/google-oauth";
import { getSession } from "@/lib/session";
import { requirePortalSession } from "@/lib/portal-session";

export async function POST() {
  await requirePortalSession();
  const session = await getSession();
  session.destroy();
  return NextResponse.redirect(`${appUrl()}/`, { status: 303 });
}
