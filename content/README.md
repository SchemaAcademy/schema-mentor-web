# Content Conventions

This repo keeps course/lab material as `.mdx` files under `content/`.

Each MDX file must start with YAML frontmatter using the unified schema enforced by
`lib/contentModel.ts`:

- `id` (string, required)
- `title` (string, required)
- `summary` (string, required)
- `domain`: `storage` | `ai-infra`
- `contentType`: `course` | `lab`
- `difficulty`: `beginner` | `intermediate` | `advanced`
- `tags` (array of non-empty strings)
- `prerequisites` (array of non-empty strings)
- `estimatedMinutes` (positive number)

Frontmatter format example:

```md
---
id: bptree-intro
title: B+Tree Introduction
summary: What a B+Tree is and how it is used.
domain: storage
contentType: course
difficulty: beginner
tags: [b+tree, index]
prerequisites: [disk-basics]
estimatedMinutes: 20
---

# Body
```

