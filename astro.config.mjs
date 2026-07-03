// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import pagefind from 'astro-pagefind';

// -----------------------------------------------------------------------------
// Hosting configuration
//
// This is a single personal website with path-based sections:
//   /            -> portfolio home
//   /projects    -> projects
//   /blog        -> blog
//   /about       -> about
//
// `base` stays '/' since the site owns the whole host (https://vijaynelakurthi.in).
// If you ever serve it from a sub-path instead, set `base: '/subpath'` and the
// helpers in the components will adapt automatically.
//
// Update `site` to your real domain before deploying — it powers canonical URLs,
// the sitemap, and the RSS feed.
// -----------------------------------------------------------------------------

export default defineConfig({
  site: 'https://portfolio.vijaynelakurthi.in',
  base: '/',
  outDir: './dist', // Forces the output to standard static structure
  trailingSlash: 'ignore',
  integrations: [
    sitemap({
      // Generated OG PNGs are routes too — keep them out of the sitemap.
      filter: (page) => !page.includes('/og/'),
      serialize(item) {
        item.lastmod = new Date().toISOString();
        return item;
      },
    }),
    pagefind(),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
});
