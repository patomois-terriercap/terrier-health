import { NextResponse, type NextRequest } from "next/server";
import { appUrl, exchangeCode } from "@/lib/google-oauth";
import { getSession } from "@/lib/session";
import { requirePortalSession } from "@/lib/portal-session";
import { saveRefreshToken } from "@/lib/google-token-store";

export async function GET(req: NextRequest) {
  await requirePortalSession();

  const params = req.nextUrl.searchParams;
  const fail = (message: string) =>
    NextResponse.redirect(
      `${appUrl()}/?error=${encodeURIComponent(message)}`,
    );

  if (params.get("error")) {
    return fail("No se completó la autorización con Google.");
  }

  const session = await getSession();
  const code = params.get("code");
  const state = params.get("state");

  if (!code || !state || state !== session.oauthState) {
    return fail("La sesión de conexión venció. Intenta nuevamente.");
  }

  session.oauthState = undefined;
  await session.save();

  try {
    const tokens = await exchangeCode(code);

    if (!tokens.refresh_token) {
      return fail(
        "Google no entregó una autorización permanente. Intenta conectar nuevamente.",
      );
    }

    await saveRefreshToken(tokens.refresh_token);

    // Los tokens de Google ahora se guardan en el servidor.
    session.accessToken = undefined;
    session.refreshToken = undefined;
    session.expiresAt = undefined;
    await session.save();
  } catch {
    return fail(
      "No se pudo guardar la conexión con Google. Revisa los logs del servidor.",
    );
  }

  return NextResponse.redirect(`${appUrl()}/`);
}