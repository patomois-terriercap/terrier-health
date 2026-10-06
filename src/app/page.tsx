import Dashboard from "@/components/dashboard";
import Landing, { type LandingMode } from "@/components/landing";
import { redirectUri } from "@/lib/google-oauth";
import { isConfigured, isDemoOnly } from "@/lib/session";
import { requirePortalSession } from "@/lib/portal-session";
import { loadRefreshToken } from "@/lib/google-token-store";

export default async function Home({ searchParams }: PageProps<"/">) {
  await requirePortalSession();

  const params = await searchParams;
  const demo = params.demo === "1";
  const error = typeof params.error === "string" ? params.error : undefined;

  let signedIn = false;

  if (isConfigured()) {
    signedIn = Boolean(await loadRefreshToken());
  }

  if (!signedIn && !demo) {
    const mode: LandingMode = isDemoOnly()
      ? "demo-only"
      : isConfigured()
        ? "ready"
        : "setup";

    return (
      <Landing mode={mode} error={error} redirectUri={redirectUri()} />
    );
  }

  return <Dashboard demo={demo && !signedIn} />;
}