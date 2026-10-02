# Contributing to Wristside

Thanks for helping out! Bug reports, data-type additions and design polish are all welcome.

## Development

```bash
npm install
cp .env.example .env.local   # optional: add Google credentials to test with real data
npm run dev
```

You can work without any credentials: open <http://localhost:3000/?demo=1> to use the
deterministic sample data in `src/lib/demo.ts`.

Before opening a pull request, run:

```bash
npm run lint
npm run typecheck
npm run build
```

CI runs the same checks.

## Guidelines

- **Never commit real health data or credentials.** That includes API responses pasted into
  tests or issues. Redact or use the demo generator instead.
- **Verify API shapes against the real API.** The Google Health API docs and real responses
  don't always match. For example, sleep sessions omit `civilEndTime`. The authoritative
  schema is the discovery document:
  `https://health.googleapis.com/$discovery/rest?version=v4`.
- **Keep the dashboard resilient.** Each data type is fetched independently. A failure should
  surface in the error banner, not blank the page.
- **Charts:** keep data colors in `src/lib/palette.ts` (light and dark steps), keep a table view
  for every chart, and respect `prefers-reduced-motion`.
- Match the surrounding code style. Keep components small and typed.

## Adding a new metric

1. Find the data type and its fields in the discovery document.
2. Fetch it in `fetchDashboard` (`src/lib/health-api.ts`) and add it to the normalized types
   in `src/lib/types.ts`.
3. Add matching sample values to `src/lib/demo.ts`.
4. Render it in a card or trend chart under `src/components/`.
