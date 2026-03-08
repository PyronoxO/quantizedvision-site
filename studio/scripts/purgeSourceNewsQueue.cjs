const { getCliClient } = require('sanity/cli');

const client = getCliClient({ apiVersion: '2024-01-01', useCdn: false });

async function run() {
  const ids = await client.fetch(`*[_type == "sourceNewsItem"]._id`);
  if (!ids.length) {
    console.log(JSON.stringify({ deleted: 0 }, null, 2));
    return;
  }

  const tx = client.transaction();
  for (const id of ids) tx.delete(id);
  await tx.commit({ visibility: 'sync' });
  console.log(JSON.stringify({ deleted: ids.length }, null, 2));
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
