import { SITE, SOCIALS } from '../site.config';

/** Absolute URL for a site-relative path. */
export function abs(path: string, site: URL | undefined): string {
  return new URL(path, site ?? SITE.url).href;
}

/** schema.org Person for the site owner — used on home + about. */
export function personSchema(site: URL | undefined) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: SITE.author,
    url: SITE.url,
    email: `mailto:${SITE.email}`,
    jobTitle: 'Software Engineer',
    description: SITE.description,
    image: abs('/og/site.png', site),
    sameAs: SOCIALS.filter((s) => s.href.startsWith('http')).map((s) => s.href),
  };
}

interface BlogPostingInput {
  title: string;
  description: string;
  url: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  tags?: string[];
}

/** schema.org BlogPosting for an article. */
export function blogPostingSchema(input: BlogPostingInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: input.title,
    description: input.description,
    image: input.image,
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    keywords: input.tags?.join(', '),
    mainEntityOfPage: { '@type': 'WebPage', '@id': input.url },
    author: { '@type': 'Person', name: SITE.author, url: SITE.url },
    publisher: { '@type': 'Person', name: SITE.author, url: SITE.url },
  };
}

interface TechArticleInput {
  title: string;
  description: string;
  url: string;
  image: string;
}

/** schema.org TechArticle for a project's technical deep-dive. */
export function techArticleSchema(input: TechArticleInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: input.title,
    description: input.description,
    image: input.image,
    mainEntityOfPage: { '@type': 'WebPage', '@id': input.url },
    author: { '@type': 'Person', name: SITE.author, url: SITE.url },
    publisher: { '@type': 'Person', name: SITE.author, url: SITE.url },
  };
}

/** schema.org BreadcrumbList from ordered [name, url] pairs. */
export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
