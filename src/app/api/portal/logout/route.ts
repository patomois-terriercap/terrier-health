import { NextResponse, type NextRequest } from "next/server";

const origins = new Set([
  "https://terriercapital.cl",
  "https://salud.terriercapital.cl",
  "https://inversiones.terriercapital.cl",
]);

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (process.env.NODE_ENV === "production" && origin && !origins.has(origin)) {
    return NextResponse.json({ error: "Origen no autorizado" }, { status: 403 });
  }
  const response = NextResponse.json({ authenticated: false });
  response.headers.set("Cache-Control", "no-store");
  response.cookies.set("terrier_shared_session", "", {
    domain: "terriercapital.cl",
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    expires: new Date(0),
    maxAge: 0,
  });
  // End the Health browser session without revoking the separately stored Google connection.
  response.cookies.set("health_session", "", {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0),
    maxAge: 0,
  });
  return response;
}
