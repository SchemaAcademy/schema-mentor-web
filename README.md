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
| Deployment | Vercel | https://vercel.com/docs |

## Project Structure

```text
SchemaMentor/
├── app/                            # Next.js App Router pages and UI components
│   ├── components/
│   │   └── BPlusTreeSimulator.tsx
│   ├── simulators/
│   │   ├── bptree/
│   │   │   └── page.tsx
│   │   └── page.tsx
│   └── page.tsx
├── content/                        # Course content in MDX
│   ├── examples/
│   │   └── bptree-intro.mdx
│   └── README.md
├── lib/                            # Domain logic + tests
│   ├── bPlusTreeSimulator.ts
│   ├── bPlusTreeSimulator.test.ts
│   ├── contentLoader.ts
│   ├── contentLoader.test.ts
│   ├── contentModel.ts
│   ├── contentModel.test.ts
│   ├── simulators.ts
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
- Build a Bitcask storage engine as the project POC.
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
