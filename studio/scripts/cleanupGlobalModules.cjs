const { getCliClient } = require('@sanity/cli');

const client = getCliClient({ apiVersion: '2024-01-01', useCdn: false });

async function run() {
  const modules = await client.fetch(`*[_type == "globalModule"]{_id,title}`);
  const deletes = [];
  for (const mod of modules || []) {
    if (mod.title === 'Find Me On Social Media' && mod._id !== 'global-social-strip' && mod._id !== 'drafts.global-social-strip') {
      deletes.push(mod._id);
    }
    if (mod.title === 'Legal Footer Links' && mod._id !== 'global-legal-footer' && mod._id !== 'drafts.global-legal-footer') {
      deletes.push(mod._id);
    }
  }

  for (const id of deletes) {
    await client.delete(id);
  }

  const verify = await client.fetch(`*[_type == "globalModule"]{_id,title,enabled,placement,scope}`);
  console.log(JSON.stringify({ deleted: deletes, verify }, null, 2));
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
