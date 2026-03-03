const fs = require("node:fs");
const path = require("node:path");
const { getCliClient } = require("@sanity/cli");

const client = getCliClient({ apiVersion: "2024-01-01" });

const targets = [
  { docId: "dummy-note-01", file: "../public/img/dummy/post-1.svg" },
  { docId: "dummy-note-02", file: "../public/img/dummy/post-2.svg" },
  { docId: "dummy-note-03", file: "../public/img/dummy/post-3.svg" },
  { docId: "dummy-note-04", file: "../public/img/dummy/post-4.svg" },
  { docId: "dummy-note-05", file: "../public/img/dummy/post-5.svg" },
  { docId: "dummy-note-06", file: "../public/img/dummy/post-6.svg" },
];

async function getOrUploadAsset(filePath) {
  const fileName = path.basename(filePath);
  const existing = await client.fetch(
    "*[_type == 'sanity.imageAsset' && originalFilename == $fileName][0]{_id}",
    { fileName }
  );
  if (existing && existing._id) return existing._id;

  const stream = fs.createReadStream(filePath);
  const asset = await client.assets.upload("image", stream, {
    filename: fileName,
    title: fileName,
  });
  return asset._id;
}

async function run() {
  for (const target of targets) {
    const absolutePath = path.resolve(process.cwd(), target.file);
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Missing image file: ${absolutePath}`);
    }

    const assetId = await getOrUploadAsset(absolutePath);
    await client
      .patch(target.docId)
      .set({
        cover: {
          _type: "image",
          asset: {
            _type: "reference",
            _ref: assetId,
          },
        },
      })
      .commit();
    console.log(`Patched ${target.docId} with ${path.basename(absolutePath)} -> ${assetId}`);
  }

  console.log("Done.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
