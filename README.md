# SchemaMentor

An interactive learning product for **database storage internals** (e.g. B+Tree, LSM Tree, WAL recovery).

GitHub: https://github.com/SchemaAcademy/schema-mentor-web

## Frontend Tech Selection

| Area | Choice | Official Docs |
|---|---|---|
| App Framework | Next.js (App Router) | https://nextjs.org/docs/app |
| UI Library | React | https://react.dev/ |
| Language | TypeScript | https://www.typescriptlang.org/docs/ |
| Styling | Tailwind CSS | https://tailwindcss.com/docs |
| UI Components | shadcn/ui | https://ui.shadcn.com/ |
| Client State (simulators) | Zustand | https://docs.pmnd.rs/zustand/getting-started/introduction |
| Server/Async Data | TanStack Query | https://tanstack.com/query/latest |
| Visualization (graphs/flows) | React Flow | https://reactflow.dev/ |
| Custom Graphics | D3.js | https://d3js.org/getting-started |
| Animations | Framer Motion | https://www.framer.com/motion/ |
| Course Content Format | MDX | https://mdxjs.com/ |
| Unit Testing | Vitest | https://vitest.dev/guide/ |
| UI Testing Utilities | Testing Library | https://testing-library.com/docs/ |
| E2E Testing | Playwright | https://playwright.dev/docs/intro |
| Linting/Formatting | ESLint | https://eslint.org/docs/latest/ |
| Error Monitoring | Sentry | https://docs.sentry.io/ |
| Product Analytics | PostHog | https://posthog.com/docs |
| Deployment | GitHub Pages (static export) or Vercel | https://docs.github.com/pages · https://vercel.com/docs |

## Project Structure

```text
SchemaMentor/
├── app/                            # Next.js App Router pages and UI components
│   ├── components/
│   │   ├── BPlusTreeSimulator.tsx
│   │   └── BitcaskPocPanel.tsx     # Bitcask POC UI (client; uses BitcaskMemory)
│   ├── simulators/
│   │   ├── bptree/
│   │   │   └── page.tsx
│   │   ├── bitcask/
│   │   │   └── page.tsx            # Route: /simulators/bitcask
│   │   └── page.tsx
│   └── page.tsx
├── content/                        # Course content in MDX
│   ├── examples/
│   │   └── bptree-intro.mdx
│   └── README.md
├── lib/                            # Domain logic + tests
│   ├── bPlusTreeSimulator.ts
│   ├── bPlusTreeSimulator.test.ts
│   ├── bitcask.ts                  # Node: append-only file + keydir (tests / server-side)
│   ├── bitcask.test.ts
│   ├── bitcaskFormat.ts            # Shared record header + KeydirEntry type
│   ├── bitcaskMemory.ts            # In-memory log (browser + static export)
│   ├── bitcaskMemory.test.ts
│   ├── contentLoader.ts
│   ├── contentLoader.test.ts
│   ├── contentModel.ts
│   ├── contentModel.test.ts
│   ├── simulators.ts               # Simulator routes (bptree, bitcask)
│   └── simulators.test.ts
├── public/                         # Static assets
├── README.md
├── package.json
├── tsconfig.json
├── next.config.ts
├── eslint.config.mjs
├── vitest.config.ts
└── postcss.config.mjs
```

## Bitcask (POC)

The project includes a **Bitcask-style** proof of concept: an append-only byte log plus an in-memory **keydir** (map from key → latest value offset, size, and timestamp). Reads resolve the key through the keydir and load value bytes from the log; writes append a new record and update the keydir.

### Record layout (`lib/bitcaskFormat.ts`)

Each record starts with a **12-byte big-endian header**:

| Field | Size | Meaning |
| --- | --- | --- |
| `timestamp` | 4 bytes | Unix seconds (`uint32`) |
| `key_len` | 4 bytes | UTF-8 key length (`uint32`) |
| `value_len` | 4 bytes | Value length; **`0` means tombstone** (`uint32`) |

Followed by `key_len` bytes of key and `value_len` bytes of value. On **replay** (scanning the log from the start), the last record for a key wins; tombstones remove the key from the keydir.

### Implementations

| Module | Role |
| --- | --- |
| **`lib/bitcask.ts`** (`Bitcask`) | Node `fs` implementation: single active file `active.data` under a data directory, append-only writes, `reloadFromDisk()` rebuilds the keydir, `get`/`put`/`delete`/`listKeys`/`close`. Empty values are rejected (reserved for tombstones). |
| **`lib/bitcaskMemory.ts`** (`BitcaskMemory`) | Same layout in memory (`Uint8Array` log), UTF-8 string API for the UI. Safe in the browser and with `output: 'export'` (no server filesystem). Exposes `replay()` to rebuild the keydir like disk replay. |
| **`app/components/BitcaskPocPanel.tsx`** | Interactive POC: Put / Get / Delete, key list, live log size. |
| **`app/simulators/bitcask/page.tsx`** | Simulator page at **`/simulators/bitcask`** (see `lib/simulators.ts`). |

### Tests

- `lib/bitcask.test.ts` — file-backed store (put/get/delete, replay, truncation errors).
- `lib/bitcaskMemory.test.ts` — in-memory store and replay semantics.
- `lib/simulators.test.ts` — includes Bitcask route registration.

Run `npm run test` to execute them.

## TODO / Roadmap

### Phase 0 (Skeleton & Foundation)
- Initialize Web project structure in the repo root (Next.js app).
- Bitcask POC: append-only log + keydir (`lib/bitcask*`, simulator at `/simulators/bitcask`; see [Bitcask (POC)](#bitcask-poc)).
- Add reusable UI layout + course page template
- Ensure quality gates: `lint` + unit tests + a smoke E2E (later)

### Phase 1 (Storage Engine MVP - interactive first)
- Implement first simulator (recommended: **B+Tree**)
- Provide: step-by-step playback, parameter controls, and explanation panel

### Phase 2 (Learning Loop)
- Learning path + chapter dependency graph
- Quiz/question module (concept + process-based questions)
- Analytics: track completion and parameter usage

### Phase 3 (AI Infra Track - prepared extension)
- Extend the same content metadata model with `domain = ai-infra`
- Reuse the simulator framework for AI infra topics (e.g. KV Cache concepts)

## Local Development

The Next.js app lives in the repo root.

```bash
npm install
npm run dev
```

Test/lint:

```bash
npm run test
npm run lint
```

### GitHub Pages

The app is configured for Next.js [static HTML export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports) (`output: 'export'` in `next.config.ts`). A workflow in `.github/workflows/deploy-github-pages.yml` builds on push to `main` or `master` and deploys the `out/` directory.

1. In the repository on GitHub: **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions**.
2. Push to `main`; the **Deploy GitHub Pages** workflow runs and publishes the site.

For a normal project site (`https://<user>.github.io/<repo>/`), the workflow sets `BASE_PATH` to `/<repo>` automatically. If the repository is named `<user>.github.io` (site at the domain root), the workflow uses an empty base path.

Preview the production build locally:

```bash
npm run build
npx serve out
```

To match a project Pages URL locally, run `BASE_PATH=/<your-repo-name> npm run build` before serving `out/`. Use `npm run dev` for day-to-day development; static export does not use `npm run start`.
