const { getCliClient } = require('@sanity/cli');

const client = getCliClient({ apiVersion: '2024-01-01', useCdn: false });

const RECIPIENT_EMAIL = 'quantizedvision@gmail.com';

const nowKey = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const slugValue = (value) => ({ _type: 'slug', current: value });

const hero = (title, body, opts = {}) => ({
  title,
  body,
  eyebrow: opts.eyebrow || '',
  primaryLabel: opts.primaryLabel || '',
  primaryUrl: opts.primaryUrl || '',
  secondaryLabel: opts.secondaryLabel || '',
  secondaryUrl: opts.secondaryUrl || '',
  enableSlider: typeof opts.enableSlider === 'boolean' ? opts.enableSlider : true,
  autoplay: typeof opts.autoplay === 'boolean' ? opts.autoplay : true,
  autoplayMs: opts.autoplayMs || 4200,
  transitionMs: opts.transitionMs || 850,
  showArrows: typeof opts.showArrows === 'boolean' ? opts.showArrows : true,
  showDots: typeof opts.showDots === 'boolean' ? opts.showDots : true,
});

const cta = (heading, body, buttonLabel, buttonUrl, accent = 'red') => ({
  _key: nowKey(),
  _type: 'homeCtaSection',
  heading,
  body,
  buttonLabel,
  buttonUrl,
  accent,
});

const pagesSeed = [
  {
    slug: 'home',
    title: 'Home',
    isHome: true,
    themeVariant: 'crimson-ice',
    hero: hero(
      'Quantized Vision',
      'Bold AI artistry meets computational vision. Build narratives across stills, motion, and social-first visual systems.',
      {
        eyebrow: 'Visual Lab',
        primaryLabel: 'Enter the Gallery',
        primaryUrl: '/gallery',
        secondaryLabel: 'Read Posts',
        secondaryUrl: '/posts',
      },
    ),
    sections: [
      {
        _key: nowKey(),
        _type: 'homeStatsSection',
        heading: 'Studio Snapshot',
        items: [
          { _key: nowKey(), value: '07', label: 'Published artworks' },
          { _key: nowKey(), value: '06', label: 'Editorial posts' },
          { _key: nowKey(), value: '∞', label: 'Creative directions' },
        ],
      },
      {
        _key: nowKey(),
        _type: 'homeGallerySection',
        heading: 'Featured Gallery',
        description: 'A selected slice of recent visual pieces and social-linked releases.',
        styleVariant: 'masonry',
        limit: 6,
      },
      {
        _key: nowKey(),
        _type: 'homePostsSection',
        heading: 'Latest Posts',
        description: 'Process notes, release breakdowns, and pipeline experiments.',
        styleVariant: 'carousel',
        limit: 6,
      },
      cta(
        'Commission Direction',
        'For campaign visuals, AI motion concepts, social launch kits, and custom art systems.',
        'Start a Project',
        '/contacts',
        'red',
      ),
    ],
  },
  {
    slug: 'gallery',
    title: 'Gallery',
    themeVariant: 'crimson-ice',
    hero: hero(
      'Gallery Archive',
      'Explore image sets, sub-galleries, and external releases in one exhibition wall.',
      {
        eyebrow: 'Portfolio',
        primaryLabel: 'Open Contact',
        primaryUrl: '/contacts',
      },
    ),
    sections: [
      {
        _key: nowKey(),
        _type: 'artworkArchiveSection',
        heading: 'Gallery',
        description: 'Browse by collection and open entries as lightbox or sub-gallery views.',
        enableFilters: true,
      },
    ],
  },
  {
    slug: 'projects',
    title: 'Projects',
    themeVariant: 'crimson-ice',
    hero: hero(
      'Project Cases',
      'Structured campaign-style bodies of work, including production scope and tools.',
      {
        eyebrow: 'Case Files',
      },
    ),
    sections: [
      {
        _key: nowKey(),
        _type: 'projectArchiveSection',
        heading: 'Projects',
        description: 'Case-style entries for client-facing and internal experimental initiatives.',
        limit: 24,
      },
      cta(
        'Need a Full Campaign Pack?',
        'I design narrative visual systems: key art, motion snippets, and social rollout packs.',
        'Book Discovery Call',
        '/contacts',
      ),
    ],
  },
  {
    slug: 'posts',
    title: 'Posts',
    themeVariant: 'crimson-ice',
    hero: hero(
      'Studio Posts',
      'Behind-the-scenes posts covering workflow, toolchains, and release strategy.',
      {
        eyebrow: 'Editorial',
      },
    ),
    sections: [
      {
        _key: nowKey(),
        _type: 'homeSearchSection',
        heading: 'Search',
        placeholder: 'Search posts, artworks, and project case studies...',
        emptyMessage: 'No results matched this query yet.',
        limit: 10,
      },
      {
        _key: nowKey(),
        _type: 'postArchiveSection',
        heading: 'Posts',
        description: 'Published notes and process breakdowns.',
        limit: 50,
      },
    ],
  },
  {
    slug: 'about',
    title: 'About',
    themeVariant: 'crimson-ice',
    hero: hero(
      'About Quantized Vision',
      'Creative direction studio focused on AI-assisted image systems, motion fragments, and narrative worldbuilding.',
      {
        eyebrow: 'Studio Profile',
      },
    ),
    sections: [
      cta(
        'What I Build',
        'Visual identity systems, cinematic stills, social launch visuals, and artist-first content frameworks.',
        'Explore Gallery',
        '/gallery',
        'blue',
      ),
      {
        _key: nowKey(),
        _type: 'homeStatsSection',
        heading: 'Capabilities',
        items: [
          { _key: nowKey(), value: 'Visual Systems', label: 'Brand-native aesthetics' },
          { _key: nowKey(), value: 'Motion Ready', label: 'Stills-to-reels pipeline' },
          { _key: nowKey(), value: 'Platform Native', label: 'TikTok / IG / YouTube output' },
        ],
      },
    ],
  },
  {
    slug: 'contacts',
    title: 'Contacts',
    themeVariant: 'crimson-ice',
    hero: hero(
      'Contact',
      'Send project details and I will reply with scope, timeline, and production path.',
      {
        eyebrow: 'Work Together',
      },
    ),
    sections: [
      {
        _key: nowKey(),
        _type: 'homeContactSection',
        heading: 'Project Inquiry',
        body: 'Use this form for commissions, collaborations, licensing requests, and campaign briefs.',
        recipientEmail: RECIPIENT_EMAIL,
        subjectLabel: 'Subject',
        emailLabel: 'Email',
        phoneLabel: 'Phone',
        messageLabel: 'Message',
        submitLabel: 'Send Inquiry',
        subjectPlaceholder: 'Licensing / Commission / Collaboration',
        emailPlaceholder: 'you@example.com',
        phonePlaceholder: '+1 555 000 0000',
        messagePlaceholder: 'Share objective, style, deadlines, and references.',
      },
    ],
  },
  {
    slug: 'copyright-licensing',
    title: 'Copyright & Licensing',
    themeVariant: 'crimson-ice',
    hero: hero('Copyright & Licensing', 'Usage rights and licensing policy for Quantized Vision content.', {
      eyebrow: 'Legal',
    }),
    sections: [
      cta(
        'Rights Statement',
        'All images, videos, and branded assets on this site are protected by copyright unless otherwise noted. Reproduction, reposting, commercial use, model training, or derivative distribution requires prior written permission.',
        'Request Licensing',
        '/contacts',
      ),
      cta(
        'Licensing Scope',
        'Licensing can include social usage, advertising, editorial distribution, or timed exclusivity. Terms are negotiated per project and documented in writing.',
        'Contact for Terms',
        '/contacts',
        'blue',
      ),
    ],
  },
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    themeVariant: 'crimson-ice',
    hero: hero('Privacy Policy', 'What data is collected and how it is used.', { eyebrow: 'Legal' }),
    sections: [
      cta(
        'Privacy Summary',
        'This site may collect basic analytics and contact form submissions (email, phone, message) solely for communication and service delivery. Data is not sold. Contact requests can be deleted upon request.',
        'Privacy Questions',
        '/contacts',
        'blue',
      ),
    ],
  },
  {
    slug: 'terms-of-use',
    title: 'Terms of Use',
    themeVariant: 'crimson-ice',
    hero: hero('Terms of Use', 'General conditions for using this website and its content.', { eyebrow: 'Legal' }),
    sections: [
      cta(
        'Terms Summary',
        'By using this site, you agree not to misuse, scrape, republish, or commercially exploit content without authorization. External platform embeds remain governed by their respective platform terms.',
        'Contact for Clarification',
        '/contacts',
      ),
    ],
  },
];

const projectSeed = [
  {
    _id: 'seed-project-01',
    _type: 'project',
    title: 'Neon Corridor Launch Kit',
    slug: slugValue('neon-corridor-launch-kit'),
    date: '2026-03-01',
    summary: 'Campaign visual direction for a dark-futurist single release, spanning key art, reels cutdowns, and social launch assets.',
    stack: ['kling', 'midjourney', 'after effects', 'resolve'],
    externalUrl: 'https://example.com/project/neon-corridor',
  },
  {
    _id: 'seed-project-02',
    _type: 'project',
    title: 'Crimson Ice Identity System',
    slug: slugValue('crimson-ice-identity-system'),
    date: '2026-02-18',
    summary: 'A modular visual language for social-first identity, including typography rules, chroma variants, and hero compositions.',
    stack: ['midjourney', 'photoshop', 'figma'],
    externalUrl: 'https://example.com/project/crimson-ice',
  },
  {
    _id: 'seed-project-03',
    _type: 'project',
    title: 'Noir Portrait Motion Pipeline',
    slug: slugValue('noir-portrait-motion-pipeline'),
    date: '2026-02-04',
    summary: 'Still-to-motion pipeline converting portrait frames into short cinematic loops optimized for TikTok and Instagram.',
    stack: ['pika', 'runway', 'resolve'],
    externalUrl: 'https://example.com/project/noir-portrait',
  },
];

const globalModulesSeed = [
  {
    _id: 'global-social-strip',
    _type: 'globalModule',
    title: 'Find Me On Social Media',
    enabled: true,
    placement: 'after',
    scope: 'all',
    sections: [
      {
        _key: nowKey(),
        _type: 'homeSocialSection',
        heading: '',
        alignment: 'center',
        iconSize: 'md',
        links: [
          { _key: nowKey(), platform: 'tiktok', url: 'https://www.tiktok.com/@quantizedvision' },
          { _key: nowKey(), platform: 'instagram', url: 'https://www.instagram.com/quantizedvision' },
          { _key: nowKey(), platform: 'youtube', url: 'https://www.youtube.com/@quantizedvision' },
          { _key: nowKey(), platform: 'facebook', url: 'https://www.facebook.com/quantizedvision' },
        ],
      },
    ],
  },
  {
    _id: 'global-legal-footer',
    _type: 'globalModule',
    title: 'Legal Footer Links',
    enabled: true,
    placement: 'after',
    scope: 'all',
    sections: [
      {
        _key: nowKey(),
        _type: 'homeFooterSection',
        brand: 'Quantized Vision',
        tagline: 'All visual content is protected. Licensing available on request.',
        links: [
          { _key: nowKey(), label: 'Copyright', url: '/copyright-licensing' },
          { _key: nowKey(), label: 'Privacy', url: '/privacy-policy' },
          { _key: nowKey(), label: 'Terms', url: '/terms-of-use' },
          { _key: nowKey(), label: 'Contact', url: '/contacts' },
        ],
      },
    ],
  },
];

async function ensurePage(seed) {
  const existing = await client.fetch(
    `*[_type == "page" && slug.current == $slug][0]{_id}`,
    { slug: seed.slug },
  );

  const payload = {
    _type: 'page',
    title: seed.title,
    slug: slugValue(seed.slug),
    isHome: Boolean(seed.isHome),
    is404: false,
    themeVariant: seed.themeVariant || 'crimson-ice',
    hero: seed.hero,
    sections: seed.sections,
    seo: {
      metaTitle: `${seed.title} | Quantized Vision`,
      metaDescription: typeof seed.hero?.body === 'string' ? seed.hero.body.slice(0, 160) : '',
      noIndex: false,
    },
  };

  if (existing?._id) {
    await client.patch(existing._id).set(payload).commit({ autoGenerateArrayKeys: true });
    return { action: 'patched', id: existing._id, slug: seed.slug };
  }

  const created = await client.create({ _id: `page-${seed.slug}`, ...payload });
  return { action: 'created', id: created._id, slug: seed.slug };
}

async function ensureSiteSettings() {
  const pages = await client.fetch(`*[_type == "page"]{_id,title,isHome,"slug":slug.current}`);
  const bySlug = new Map();
  for (const page of pages || []) {
    if (page?.slug) bySlug.set(page.slug, page);
    if (page?.isHome) bySlug.set('home', page);
  }

  const navOrder = [
    { label: 'Home', slug: 'home', fallbackUrl: '/' },
    { label: 'Gallery', slug: 'gallery', fallbackUrl: '/gallery' },
    { label: 'Projects', slug: 'projects', fallbackUrl: '/projects' },
    { label: 'Posts', slug: 'posts', fallbackUrl: '/posts' },
    { label: 'About', slug: 'about', fallbackUrl: '/about' },
    { label: 'Contact', slug: 'contacts', fallbackUrl: '/contacts' },
  ];

  const navItems = navOrder.map((item) => {
    const page = bySlug.get(item.slug);
    const key = `${item.slug}-${nowKey()}`;
    if (page?._id) {
      return {
        _key: key,
        label: item.label,
        openInNewTab: false,
        pageRef: { _type: 'reference', _ref: page._id.replace(/^drafts\./, '') },
        url: null,
      };
    }
    return {
      _key: key,
      label: item.label,
      openInNewTab: false,
      pageRef: null,
      url: item.fallbackUrl,
    };
  });

  const existing = await client.fetch(`coalesce(*[_id == "drafts.siteSettings"][0], *[_id == "siteSettings"][0]){_id,design}`);

  const designDefaults = {
    headingFont: 'bebas-neue',
    bodyFont: 'space-grotesk',
    uiFont: 'bebas-neue',
    h1Size: '7.3',
    h2Size: '2.6',
    h3Size: '1.8',
    h4Size: '1.35',
    h5Size: '1.1',
    h6Size: '0.95',
    bodySize: '1',
    textColor: '#ecf2ff',
    mutedColor: '#94a2c9',
    accentColor: '#e11d48',
    linkColor: '#d4e1f1',
  };

  if (existing?._id) {
    await client
      .patch(existing._id)
      .set({ navigation: navItems, design: existing.design || designDefaults })
      .commit({ autoGenerateArrayKeys: false });
    return { action: 'patched', id: existing._id };
  }

  await client.create({
    _id: 'siteSettings',
    _type: 'siteSettings',
    navigation: navItems,
    design: designDefaults,
  });
  return { action: 'created', id: 'siteSettings' };
}

async function ensureProjects() {
  const outcomes = [];
  for (const project of projectSeed) {
    const exists = await client.fetch(`*[_id == $id][0]{_id}`, { id: project._id });
    if (exists?._id) {
      outcomes.push({ id: project._id, action: 'kept' });
      continue;
    }
    await client.create(project);
    outcomes.push({ id: project._id, action: 'created' });
  }
  return outcomes;
}

async function ensureGlobalModules() {
  const outcomes = [];
  for (const module of globalModulesSeed) {
    const existing = await client.fetch(`coalesce(*[_id == $draftId][0], *[_id == $id][0]){_id}`, {
      id: module._id,
      draftId: `drafts.${module._id}`,
    });

    if (existing?._id) {
      await client.patch(existing._id).set(module).commit({ autoGenerateArrayKeys: true });
      outcomes.push({ id: module._id, action: 'patched' });
      continue;
    }

    await client.create(module);
    outcomes.push({ id: module._id, action: 'created' });
  }
  return outcomes;
}

async function run() {
  const pageOutcomes = [];
  for (const seed of pagesSeed) {
    pageOutcomes.push(await ensurePage(seed));
  }

  const [settingsOutcome, projectOutcomes, moduleOutcomes] = await Promise.all([
    ensureSiteSettings(),
    ensureProjects(),
    ensureGlobalModules(),
  ]);

  const verify = await client.fetch(`{
    "pages": *[_type == "page"]|order(isHome desc,title asc){title,"slug":slug.current,isHome,"sections":count(sections)},
    "projects": *[_type == "project"]|order(date desc){title,"slug":slug.current,date}[0..5],
    "modules": *[_type == "globalModule"]{title,enabled,placement,scope,"sections":count(sections)},
    "navigation": *[_id == "siteSettings"][0].navigation[]{label,url,"slug":pageRef->slug.current}
  }`);

  console.log(JSON.stringify({
    pageOutcomes,
    settingsOutcome,
    projectOutcomes,
    moduleOutcomes,
    verify,
  }, null, 2));
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
