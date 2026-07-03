export const SITE = {
  name: 'Vijay Nelakurthi',
  shortName: 'VN',
  title: 'Vijay Nelakurthi — Software Engineer',
  tagline: 'Backend, architecture & platform engineering — and the tooling that makes teams faster.',
  description:
    'Vijay Nelakurthi — software engineer building event-driven Java/Spring Boot microservices in telecom BSS, plus platform engineering and developer-experience tooling (IDE extensions, MCP servers, AI workflows).',
  url: 'https://vijaynelakurthi.in',
  author: 'Vijay Nelakurthi',
  email: 'vijaychowdary2249@protonmail.com',
} as const;

export const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Projects', href: '/projects' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'Search', href: '/search' },
] as const;

// Shown in the footer (lighter-weight links than the primary nav).
export const FOOTER_NAV = [
  { label: 'Home', href: '/' },
  { label: 'Projects', href: '/projects' },
  { label: 'Blog', href: '/blog' },
  { label: 'Tags', href: '/tags' },
  { label: 'About', href: '/about' },
  { label: 'Now', href: '/now' },
] as const;

export const SOCIALS = [
  { label: 'GitHub', href: 'https://github.com/vijay2249', handle: '@vijay2249' },
  { label: 'Dev.to', href: 'https://dev.to/vijay2249', handle: 'dev.to/vijay2249' },
  { label: 'WeDontTrack', href: 'https://github.com/WeDontTrack', handle: 'WeDontTrack' },
  { label: 'TryHackMe', href: 'https://tryhackme.com/r/p/HomelyRunaway', handle: 'HomelyRunaway' },
  { label: 'Email', href: 'mailto:vijaychowdary2249@protonmail.com', handle: 'Email me' },
] as const;

// Blog categories — the three kinds of writing.
export const CATEGORIES = {
  tutorial: {
    label: 'Tech & Coding',
    blurb: 'Tutorials, project write-ups, and "things I learned" posts.',
  },
  journal: {
    label: 'Developer Journal',
    blurb: 'What I am building, weekly logs, and lessons from failures.',
  },
  note: {
    label: 'Digital Garden',
    blurb: 'Interlinked, evolving notes — tended over time rather than dated once.',
  },
} as const;

export type CategoryKey = keyof typeof CATEGORIES;

// Headline numbers for the home page.
export const METRICS = [
  { num: '15+', label: 'tools & services shipped' },
  { num: '5', label: 'languages in production use' },
  { num: '3', label: 'IDE / editor platforms targeted' },
  // { num: '50%', label: 'fewer file reads via caching*' },
] as const;

// "What I bring" — capability cards used on home + about.
export const FOCUS = [
  {
    icon: '⚙️',
    title: 'Backend & Architecture',
    body: 'Designing and building resilient, event-driven microservices and the contracts between them.',
    chips: [
      'Java',
      'Spring Boot',
      'REST APIs',
      'Apache Kafka',
      'Event-driven design',
      'PostgreSQL',
      'JUnit',
      'MapStruct',
      'SOLID',
    ],
  },
  {
    icon: '🚀',
    title: 'Platform & DevOps',
    body: 'Getting services to production reliably and keeping quality gates honest along the way.',
    chips: [
      'Docker',
      'OpenShift / Kubernetes',
      'Helm',
      'Jenkins',
      'GitHub Actions',
      'SonarQube',
      'JaCoCo',
      'Nginx',
      'Linux',
    ],
  },
  {
    icon: '🧩',
    title: 'Developer Tooling & AI',
    body: 'Turning recurring friction into shipped tools — extensions, plugins, MCP servers, agents.',
    chips: [
      'VS Code extensions',
      'IntelliJ plugins',
      'TypeScript',
      'MCP servers',
      'AI agent workflows',
      'Static analysis',
      'Python automation',
    ],
  },
  {
    icon: '🎨',
    title: 'Frontend & Product',
    body: 'Shipping clean, accessible UIs when the tool needs a face — and full apps end to end.',
    chips: [
      'React',
      'Svelte',
      'Next.js',
      'Astro',
      'Material UI',
      'Flutter',
      'HTML / CSS',
    ],
  },
] as const;

// "The kind of leverage I add" — used on the about page.
export const IMPACT = [
  {
    title: 'Force multiplier',
    body: 'The tools I build (coverage, static analysis, flow visualization) speed up every engineer who touches the codebase — not just my own output.',
  },
  {
    title: 'Architecture you can maintain',
    body: 'SOLID boundaries, clear contracts, and test coverage mean my services stay changeable as requirements move — lower long-term cost of ownership.',
  },
  {
    title: 'Production-minded',
    body: 'I think in deployments, quality gates, observability and security from day one — Helm/OpenShift, Sonar/JaCoCo, TLS and RBAC are part of how I work.',
  },
  {
    title: 'AI-native engineer',
    body: 'I build with and for AI agents — MCP integrations, automated triage, and standards-as-guardrails — turning emerging tooling into real productivity.',
  },
  {
    title: 'Polyglot & adaptable',
    body: 'Java, TypeScript, Go, Python, Dart — I pick the right tool, ramp quickly, and ship across backend, infra, and frontend.',
  },
  {
    title: 'Owns the docs',
    body: 'Every project ships with architecture diagrams, settings tables, and troubleshooting guides. Knowledge does not stay locked in my head.',
  },
] as const;
