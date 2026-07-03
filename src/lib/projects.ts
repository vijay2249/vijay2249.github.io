import { getCollection, type CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;

const isProd = import.meta.env.PROD;

/** All publishable projects, ordered by `order` then title. */
export async function getProjects(): Promise<Project[]> {
  const projects = await getCollection('projects', ({ data }) =>
    isProd ? data.draft !== true : true,
  );
  return projects.sort(
    (a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title),
  );
}

export const STATUS_LABEL: Record<string, string> = {
  active: 'Active',
  'in-progress': 'In progress',
  experimental: 'Experimental',
  shipped: 'Shipped',
};
