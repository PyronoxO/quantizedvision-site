const { getCliClient } = require('@sanity/cli');

const client = getCliClient({ apiVersion: '2024-01-01', useCdn: false });

const ORDER = [
  { label: 'Home', slug: 'home', fallbackUrl: '/' },
  { label: 'Gallery', slug: 'gallery', fallbackUrl: '/gallery' },
  { label: 'Projects', slug: 'projects', fallbackUrl: '/projects' },
  { label: 'Posts', slug: 'posts', fallbackUrl: '/posts' },
  { label: 'About', slug: 'about', fallbackUrl: '/about' },
  { label: 'Contact', slug: 'contacts', fallbackUrl: '/contacts' },
];

function navItem(label, pageId, fallbackUrl) {
  const base = {
    _key: `${label.toLowerCase()}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    label,
    openInNewTab: false,
  };
  if (pageId) {
    return {
      ...base,
      pageRef: {
        _type: 'reference',
        _ref: pageId.replace(/^drafts\./, ''),
      },
      url: null,
    };
  }
  return {
    ...base,
    url: fallbackUrl,
    pageRef: null,
  };
}

async function run() {
  const pages = await client.fetch(`*[_type == "page"]{_id,title,"slug":slug.current,isHome}`);
  const bySlug = new Map();
  for (const p of pages || []) {
    if (p?.slug) bySlug.set(String(p.slug).toLowerCase(), p);
    if (p?.isHome) bySlug.set('home', p);
  }

  const items = ORDER.map((entry) => {
    const page = bySlug.get(entry.slug.toLowerCase());
    return navItem(entry.label, page?._id, entry.fallbackUrl);
  });

  const existing = await client.fetch(`coalesce(*[_id == "drafts.siteSettings"][0], *[_id == "siteSettings"][0]){_id}`);

  if (existing?._id) {
    await client.patch(existing._id).set({ navigation: items }).commit({ autoGenerateArrayKeys: false });
  } else {
    await client.create({
      _id: 'siteSettings',
      _type: 'siteSettings',
      navigation: items,
    });
  }

  const verify = await client.fetch(`
    *[_type == "siteSettings" && _id == "siteSettings"][0]{
      _id,
      navigation[]{
        label,
        url,
        openInNewTab,
        "page": pageRef->{title,"slug":slug.current,isHome}
      }
    }
  `);

  console.log(JSON.stringify({ updated: true, verify }, null, 2));
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
