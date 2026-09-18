# SchemaMentor

SchemaMentor is an interactive learning platform for database storage-engine internals. It turns a user action into an observable sequence of state changes, structural diagrams, and synchronized explanations.

## Design and AI development conventions

[Design and interaction principles](docs/design-principles.md) is the primary reference for future page work. It defines the learning loop, layout and visual tokens, animation semantics, state architecture, interaction boundaries, reusable AI task prompts, and acceptance checks. [AGENTS.md](AGENTS.md) is the concise entry point for contributors and AI agents.

## Current capabilities

- `/` — Exploration space with a small, interactive B+ Tree insertion-and-split preview.
- `/simulators` — Catalog of three interactive storage-engine labs.
- `/simulators/bptree` — Unique integer-key insertion, root-to-leaf search, visible transient overflow and splitting, immutable snapshots, pause/step/replay/speed controls, custom input, three presets, and a 2–5 key node capacity.
- `/simulators/lsm` — Ordered MemTable writes, freezing, sequential flushing, Level 0 SSTables, and compaction of repeated keys. Includes configurable thresholds, custom key-value writes, and frame-by-frame playback.
- `/simulators/bitcask` — Append-only records, Keydir mappings to the latest offset, visible stale records, and compaction. Includes custom key-value writes and frame-by-frame playback.
- `/guide` — Observation tasks, a learning path, and the scope of each teaching model.

WAL, data-page layout, deletes, concurrency, and real disk I/O are not implemented. Every lab calls out its teaching-model boundary. The B+ Tree uses key count as its capacity model, and its split frame shows the final result of a cascading split sequence.

## Run and validate

Requires Node.js 20.9 or later:

```bash
npm ci
npm run dev
# http://127.0.0.1:3000

npm run lint
npm run test
npm run build
```

The stack is Next.js 16, React 19, TypeScript, Tailwind CSS 4, and Vitest. The app uses system fonts and does not require a database, account, or remote font service.

## Project structure

```text
app/components/              Navigation, catalog, diagrams, landing preview, and lab UIs
app/simulators/              B+ Tree, LSM Tree, and Bitcask routes
app/guide/                   Learning guide
app/globals.css              Design tokens, layout, responsive styles, and reduced-motion support
lib/bPlusTreeSimulator.ts    B+ Tree domain model
lib/bPlusTreeLesson.ts       B+ Tree teaching snapshots, paths, and statistics
lib/lsmLesson.ts             LSM teaching snapshots and statistics
lib/bitcaskLesson.ts         Bitcask teaching snapshots and statistics
lib/*.test.ts                Domain and content-model tests
content/                     Example MDX content model; not yet rendered by the app
docs/design-principles.md    Design and interaction conventions for continued iteration
AGENTS.md                    Contributor and AI-agent entry point
```

## GitLab Pages deployment

The repository includes a [`.gitlab-ci.yml`](.gitlab-ci.yml) Pages job. It installs dependencies, runs lint and tests, builds the static site, and publishes the `out/` directory whenever the default branch changes. GitLab Pages requires an enabled project runner and an `index.html` file in the published directory. [GitLab Pages documentation](https://docs.gitlab.com/user/project/pages/)

For a typical project site, the pipeline sets `BASE_PATH=/$CI_PROJECT_NAME`, so generated links work below the project path. If the Pages site is served from the domain root, set the GitLab CI/CD variable `PAGES_BASE_PATH` to `/` in **Settings → CI/CD → Variables** before running the pipeline. The deployed URL is shown in the `deploy-pages` job and under **Deploy → Pages**.

The static site has no server-side persistence, so a refresh resets an in-progress lab. To preview the static export locally, run `npm run build` followed by `npx serve out`; do not use `npm run start` for an exported build.
