import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(), // First published. For digital-garden notes this is when the note was planted.
    updated: z.coerce.date().optional(), // Optional last-tended date — shown for evolving notes / updated posts.
    author: z.string().default('Vijay Nelakurthi'),
    category: z.enum(['tutorial', 'journal', 'note']).default('tutorial'), // Which kind of writing this is.
    tags: z.array(z.string()).default([]),
    series: z.string().optional(), // Optional multi-part series grouping (e.g. "GitHub Actions").
    cover: z.string().optional(), // Optional cover image, served from /public (e.g. /images/foo.svg).
    coverAlt: z.string().optional(),
    draft: z.boolean().default(false), // Hide from listings/feeds while drafting.
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    tagline: z.string(),
    stack: z.string(), // Short label like "VS Code · TypeScript · Java".
    tech: z.array(z.string()).default([]),
    repo: z.string().url().optional(),
    website: z.string().url().optional(),
    internal: z.boolean().default(false), // True for closed-source / employer-internal work where the source can't be shared.
    license: z.string().optional(), // License shown in the footer (e.g. "GPL-3.0", "Proprietary / internal").
    status: z
      .enum(['active', 'in-progress', 'experimental', 'shipped'])
      .default('active'),
    year: z.string().optional(),
    featured: z.boolean().default(false),
    order: z.number().default(99),
    highlights: z.array(z.string()).default([]), // Quick bullet highlights shown on the card and detail page.
    cover: z.string().optional(),
    coverAlt: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

// Deep technical write-ups, one per project. File id must match the project id
// (e.g. projects-tech/maximock.md -> /projects/maximock/technical).
const projectsTech = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects-tech' }),
  schema: z.object({
    summary: z.string().optional(),
  }),
});

export const collections = { blog, projects, projectsTech };
