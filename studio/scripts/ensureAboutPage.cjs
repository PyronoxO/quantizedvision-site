const { getCliClient } = require('@sanity/cli');
const client = getCliClient({ apiVersion: '2024-01-01', useCdn: false });

async function run() {
  const existing = await client.fetch(`*[_type == "page" && slug.current == "about"][0]{_id,title,"slug":slug.current}`);
  if (existing) {
    console.log(JSON.stringify({ created: false, page: existing }, null, 2));
    return;
  }

  const doc = await client.create({
    _type: 'page',
    title: 'About',
    slug: { _type: 'slug', current: 'about' },
    isHome: false,
    themeVariant: 'crimson-ice',
    hero: {
      _type: 'object',
      eyebrow: 'About',
      title: 'About Quantized Vision',
      body: 'Use sections below to shape your full about page.',
      primaryLabel: '',
      primaryUrl: '',
      secondaryLabel: '',
      secondaryUrl: ''
    },
    sections: []
  });

  console.log(JSON.stringify({ created: true, page: { _id: doc._id, title: doc.title, slug: doc.slug?.current } }, null, 2));
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
