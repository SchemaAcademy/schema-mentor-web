# SchemaMentor

An interactive learning product for **database storage internals** (e.g. B+Tree, LSM Tree, WAL recovery).

GitHub: https://github.com/SchemaAcademy/schema-mentor-web

## Documentation

Detailed topics for contributors and tooling (including AI assistants) live under **`docs/`**:

- **[Tech stack](docs/tech-stack.md)** — Next.js, React, testing, deployment, and related choices
- **[Bitcask POC](docs/bitcask.md)** — Append-only log, keydir, record format, modules, tests
- **[B+Tree simulator](docs/b-plus-tree.md)** — Routes, `lib/bPlusTreeSimulator.ts` model and behavior

Index: [docs/README.md](docs/README.md)

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
├── docs/                           # Tech stack, Bitcask, B+Tree (see links above)
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

## TODO / Roadmap

### Phase 0 (Skeleton & Foundation)
- Initialize Web project structure in the repo root (Next.js app).
- Bitcask POC: append-only log + keydir (`lib/bitcask*`, simulator at `/simulators/bitcask`; see [docs/bitcask.md](docs/bitcask.md)).
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
