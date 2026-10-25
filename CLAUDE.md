# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Nook: an Expo (SDK 57, React Native 0.86, React 19) app for tracking craft projects (crochet, knit, sewing), backed by Supabase (auth, Postgres, storage). React Compiler and typed routes are enabled in `app.json`.

## Commands

```bash
npm install                 # package-lock.json is committed (package.json also declares yarn)
npx expo start              # dev server; npm run ios / android / web for a specific platform
npm run lint                # expo lint
npm run test:ci             # jest once (npm test runs in --watchAll mode)
npx jest lib/projects/insert-project.test.ts     # single file
npx jest -t "pickLatestPhotoUrl"                 # by test name
npx tsc --noEmit            # type check
```

Requires `.env` with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` (see `.env.example`); `lib/supabase.ts` throws at import time without them.

## Architecture

- **Two top-level source dirs.** `src/` holds the UI (Expo Router app in `src/app`, components, contexts, hooks, constants). `lib/` holds the Supabase client and the data layer. The `@/*` alias maps to `src/*` only (plus `@/assets/*`), so `src` imports `lib` via relative paths (e.g. `../../../lib/projects`).
- **Routing / auth gating.** `src/app/_layout.tsx` wraps everything in `ThemePreferenceProvider` → `AuthProvider` and uses `Stack.Protected` to show `(app)` when there is a session and `(auth)` otherwise. `(app)` is a stack containing `(tabs)` (native tabs via `expo-router/unstable-native-tabs` in `src/components/app-tabs.tsx`, with a `.web.tsx` variant), the `add-project` modal, and `project/[id]`.
- **Data layer (`lib/projects/`).** One function per file, re-exported from `lib/projects/index.ts`. Each function takes an optional `client` parameter defaulting to the real `supabase` client, and returns `DataResult<T>` (`{ data, error: string | null }`) rather than throwing. Shared types live in `lib/projects/types.ts`; DB rows are mapped to UI shapes by `map*Row` helpers.
- **Storage.** Photos and pattern PDFs upload to private buckets `project-photos` and `pattern-files` under `{user_id}/{project_id}/...` paths (required by the RLS policies); `lib/projects/uploads.ts` stores long-lived signed URLs.
- **Schema.** `supabase/schema/*.sql` are numbered, hand-applied SQL scripts (tables, profile trigger, RLS, storage policies, later column additions). Add new changes as the next numbered file and keep `lib/projects/types.ts` in sync.
- **Theming.** Use semantic tokens from `src/constants/colors.ts` via `useTheme()` (`src/hooks/use-theme.ts`); the resolved light/dark scheme comes from `theme-preference-context` (user preference or system), not directly from `useColorScheme`.

## Testing

- Jest with the `jest-expo` preset. Data-layer tests sit next to their source (`lib/projects/*.test.ts`); screen tests live in `tests/`.
- Data-layer tests inject a fake client from `createMockProjectsClient` (`lib/projects/test-utils.ts`) and `jest.mock("../supabase", ...)` so the real client (and its env check) never loads.
- Screen tests use `@testing-library/react-native`, mocking `expo-router` and `@/contexts/auth-context`. A manual mock of the auth client exists at `lib/__mocks__/supabase.ts`.

## Agent skills

### Issue tracker

Issues and specs live as local markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default triage vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`), recorded as `Status:` lines in issue files. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
