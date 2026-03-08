const { getCliClient } = require("sanity/cli");

const client = getCliClient({ apiVersion: "2024-01-01", useCdn: false });

function parseArgs(argv) {
  const sourceIds = [];
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i] === "--source-id" && argv[i + 1]) {
      sourceIds.push(String(argv[i + 1]).trim());
      i += 1;
    }
  }
  return sourceIds;
}

async function main() {
  const sourceIds = parseArgs(process.argv);
  if (!sourceIds.length) {
    throw new Error("Provide at least one --source-id <value>");
  }

  const queueItems = await client.fetch(
    `*[_type == "sourceNewsItem" && sourceId in $sourceIds]{_id}`,
    { sourceIds },
  );

  for (const item of queueItems) {
    await client
      .patch(item._id)
      .set({
        status: "needs_approval",
      })
      .unset(["importedAt", "importedNoteRef"])
      .commit();
  }

  const notes = await client.fetch(
    `*[_type == "note" && sourceId in $sourceIds]{_id,sourceId}`,
    { sourceIds },
  );

  for (const note of notes) {
    await client.delete(note._id);
  }

  console.log(
    JSON.stringify(
      {
        sourceIds,
        deletedNotes: notes.map((n) => n._id),
        resetQueueItems: queueItems.map((q) => q._id),
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
