import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export type HealthSession = {
  accessToken?: string;
  refreshToken?: string;
  /** Epoch ms when the access token expires. */
  expiresAt?: number;
  /** CSRF state for the in-flight OAuth handshake. */
  oauthState?: string;
};

function sessionOptions(): SessionOptions {
  const password = process.env.SESSION_SECRET;
  if (!password || password.length < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters long");
  }
  return {
    password,
    cookieName: "health_session",
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      // Refresh tokens are long-lived; keep the cookie for 90 days.
      maxAge: 60 * 60 * 24 * 90,
    },
  };
}

export async function getSession() {
  return getIronSession<HealthSession>(await cookies(), sessionOptions());
}

/** Public showcase deployments: sample data only, sign-in disabled. */
export function isDemoOnly() {
  return process.env.DEMO_ONLY === "1" || process.env.DEMO_ONLY === "true";
}

export function isConfigured() {
  if (isDemoOnly()) return false;
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.SESSION_SECRET &&
      process.env.SESSION_SECRET.length >= 32,
  );
}
