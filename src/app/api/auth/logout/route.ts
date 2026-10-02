import { NextResponse } from "next/server";
import { appUrl } from "@/lib/google-oauth";
import { getSession } from "@/lib/session";

export async function POST() {
  const session = await getSession();
  session.destroy();
  return NextResponse.redirect(`${appUrl()}/`, { status: 303 });
}
