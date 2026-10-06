import Dashboard from "@/components/dashboard";
import Landing, { type LandingMode } from "@/components/landing";
import { redirectUri } from "@/lib/google-oauth";
import { getSession, isConfigured, isDemoOnly } from "@/lib/session";
import { requirePortalSession } from "@/lib/portal-session";

export default async function Home({ searchParams }: PageProps<"/">) {
  await requirePortalSession();
  const params = await searchParams;
  const demo = params.demo === "1";
  const error = typeof params.error === "string" ? params.error : undefined;

  let signedIn = false;
  if (isConfigured()) {
    const session = await getSession();
    signedIn = Boolean(session.refreshToken || session.accessToken);
  }

  if (!signedIn && !demo) {
    const mode: LandingMode = isDemoOnly() ? "demo-only" : isConfigured() ? "ready" : "setup";
    return <Landing mode={mode} error={error} redirectUri={redirectUri()} />;
  }
  return <Dashboard demo={demo && !signedIn} />;
}
