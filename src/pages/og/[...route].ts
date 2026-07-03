import { OGImageRoute } from 'astro-og-canvas';
import { getCollection } from 'astro:content';
import { SITE } from '../../site.config';

type OgPage = { title: string; description: string; eyebrow: string };

const blog = await getCollection('blog');
const projects = await getCollection('projects');

// One OG card per shareable page, plus a site-wide default.
const pages: Record<string, OgPage> = {
  site: { title: SITE.name, description: SITE.tagline, eyebrow: 'vijaynelakurthi.in' },
};

for (const post of blog) {
  if (post.data.draft) continue;
  pages[`blog/${post.id}`] = {
    title: post.data.title,
    description: post.data.description,
    eyebrow: 'Blog',
  };
}

for (const project of projects) {
  if (project.data.draft) continue;
  pages[`projects/${project.id}`] = {
    title: project.data.title,
    description: project.data.tagline,
    eyebrow: 'Project',
  };
}

const { getStaticPaths, GET } = await OGImageRoute({
  // param: 'route',
  pages,
  getImageOptions: (_path, page: OgPage) => ({
    title: page.title,
    description: page.description,
    logo: undefined,
    bgGradient: [
      [13, 17, 28],
      [11, 14, 20],
    ],
    border: { color: [61, 220, 151], width: 18, side: 'inline-start' },
    padding: 72,
    font: {
      title: { color: [230, 233, 239], size: 64, weight: 'Bold', families: ['Inter'] },
      description: {
        color: [154, 166, 189],
        size: 30,
        weight: 'Normal',
        families: ['Inter'],
      },
    },
    fonts: ['./src/assets/fonts/Inter-Regular.ttf', './src/assets/fonts/Inter-Bold.ttf'],
  }),
});

export { getStaticPaths, GET };
