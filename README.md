# Vijay Nelakurthi — Personal website

A fast, static personal website built with [Astro](https://astro.build). One domain, path-based sections:

- `/` — **portfolio home** (intro, capabilities, featured projects, latest writing)
- `/projects` — **projects** (with a detail page per project)
- `/blog` — **blog** (tutorials, a developer journal, and a digital garden)
- `/about` — **about** (skills + the kind of leverage I add)

No trackers, no ads — meant to be self-hosted at `vijaynelakurthi.in`.

## Features

- **Markdown content collections** (`blog` + `projects`) with typed schemas (`src/content.config.ts`).
- **Projects**: status, tech stack, highlights, repo/live links, and detail pages.
- **Blog**: categories (tutorial / journal / note), **tags**, multi-part **series**, and client-side **search + category filtering**.
- **Post pages** with reading time, a sticky table of contents, related posts, cover images, and "last tended" dates for garden notes.
- **Dark/light theme** toggle with no flash of the wrong palette (system-aware default).
- **RSS feed** (`/rss.xml`) and an auto-generated **sitemap**.
- **SEO**: canonical URLs, Open Graph + Twitter tags, and a default OG image.
- **Responsive** for web and mobile, including a mobile nav menu.
- **Code syntax highlighting** via Astro's built-in Shiki.
- Comments are scaffolded (Giscus) but **disabled** — planned for a later release.

## Project structure

```
vijay-blog/
├── astro.config.mjs        # site URL, base, sitemap, markdown config
├── src/
│   ├── site.config.ts      # metadata, nav, socials, categories, skills, metrics, impact
│   ├── content.config.ts   # blog + projects collection schemas
│   ├── lib/posts.ts        # reading time, related posts, tag counts, sorting
│   ├── lib/projects.ts     # project loading + status labels
│   ├── layouts/BaseLayout.astro
│   ├── components/         # Header, Footer, Hero, PostCard, ProjectCard, TOC, ThemeToggle, Comments
│   ├── pages/
│   │   ├── index.astro      # portfolio home
│   │   ├── projects/        # index + [...slug] detail page
│   │   ├── blog/            # index (search/filter) + [...slug] post page
│   │   ├── tags/            # tag cloud + per-tag pages
│   │   ├── about.astro, now.astro, 404.astro
│   │   └── rss.xml.ts
│   └── content/
│       ├── blog/*.md        # blog posts
│       └── projects/*.md    # projects
└── public/                  # favicon, OG image, cover images
```

## Adding a project

Add a Markdown file under `src/content/projects/`. The filename becomes the URL slug.

```markdown
---
title: My project
tagline: One line describing what it is.
stack: VS Code · TypeScript        # short label shown on the card
tech: [TypeScript, Node]
status: active                     # active | in-progress | experimental | shipped
year: '2026'
featured: true                     # featured projects show on the home page
order: 1                           # lower = earlier in the list
highlights:
  - A standout bullet
repo: https://github.com/you/repo  # optional
website: https://example.com       # optional
---

Long-form description in Markdown.
```

## Develop

```bash
npm install
npm run dev      # http://localhost:4321
```

## Build & preview

```bash
npm run build    # outputs to dist/
npm run preview
```

## Writing a post

Add a Markdown file under `src/content/blog/`. The filename becomes the URL slug.

```markdown
---
title: My new post
description: A one-line summary used in cards, SEO, and the RSS feed.
date: 2026-06-26
category: tutorial        # tutorial | journal | note
tags: [java, kafka]
series: GitHub Actions    # optional — groups multi-part posts
cover: /images/my-cover.svg   # optional — lives in public/images/
coverAlt: Describe the cover
updated: 2026-06-30       # optional — shown for evolving garden notes
draft: false              # drafts are hidden in production builds
---

Your content here. Images go in `public/images/` and are referenced as `![alt](/images/foo.svg)`.
```

## Images

Put images in `public/images/` and reference them with an absolute path (`/images/your-file.png`). They're copied as-is to the build output.

## Deploy (self-hosted)

The whole site is one static build served from a single domain, with sections under paths (`/projects`, `/blog`, `/about`). No subdomains required.

1. Set your domain in `astro.config.mjs` (`site: 'https://vijaynelakurthi.in'`). Keep `base: '/'`.
2. `npm run build` produces a static `dist/` folder.
3. Serve `dist/` from any static host or your own server (e.g. Nginx):

```nginx
server {
    server_name vijaynelakurthi.in www.vijaynelakurthi.in;
    root /var/www/vijaynelakurthi/dist;
    index index.html;
    location / {
        try_files $uri $uri/ $uri.html /404.html;
    }
}
```

Point the domain's DNS at your server and add TLS (e.g. with Certbot).

## Roadmap

- **Comments** — enable Giscus in `src/components/Comments.astro` (set `ENABLE_COMMENTS` and fill in the repo/category IDs from [giscus.app](https://giscus.app)).
- Optional: per-post generated OG images, backlinks for garden notes, and a newsletter.
