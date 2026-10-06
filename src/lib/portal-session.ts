import "server-only";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type PortalSession = {
  loggedIn?: boolean;
};

export async function getPortalSession() {
  const cookieStore = await cookies();
  const password = process.env.PORTAL_SESSION_SECRET;

  if (!password || password.length < 32) {
    throw new Error("PORTAL_SESSION_SECRET no está configurado");
  }

  return getIronSession<PortalSession>(cookieStore, {
    password,
    cookieName: "terrier_shared_session",
    ttl: 60 * 60 * 24,
    cookieOptions: {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      domain: "terriercapital.cl",
    },
  });
}

export async function requirePortalSession() {
  const session = await getPortalSession();

  if (session.loggedIn !== true) {
    redirect("https://terriercapital.cl/ingresar");
  }

  return session;
}
