import { REPO_URL } from "@/lib/repo";
export default function Footer() {
  const repo = REPO_URL;
  return (
    <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6 text-xs leading-relaxed text-muted">
      <p className="max-w-[70ch]">
        Wristside is an independent open-source project, not affiliated with or endorsed by Google or Fitbit. It is
        not a medical device and does not provide medical advice.
      </p>
      {repo && (
        <a href={repo} className="font-medium text-secondary hover:text-primary" target="_blank" rel="noreferrer">
          Source on GitHub
        </a>
      )}
    </footer>
  );
}
