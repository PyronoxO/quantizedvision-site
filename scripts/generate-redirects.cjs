const fs = require("fs/promises");
const path = require("path");
const { createClient } = require("@sanity/client");

const outFile = path.resolve(process.cwd(), "dist/_redirects");

async function writeRedirects(lines) {
  const content = lines.join("\n");
  await fs.writeFile(outFile, content ? `${content}\n` : "", "utf8");
}

async function run() {
  const projectId = process.env.SANITY_PROJECT_ID;
  const dataset = process.env.SANITY_DATASET;
  const apiVersion = process.env.SANITY_API_VERSION || "2024-01-01";
  const token = process.env.SANITY_API_READ_TOKEN;

  if (!projectId || !dataset) {
    await writeRedirects([]);
    console.log("No SANITY_PROJECT_ID/SANITY_DATASET found. Wrote empty dist/_redirects.");
    return;
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token,
    perspective: "published",
  });

  const redirects = await client.fetch(
    `*[_type == "redirect" && enabled == true && defined(from) && defined(to)]{from,to,statusCode}`
  );

  const lines = (redirects || [])
    .map((row) => {
      const from = String(row.from || "").trim();
      const to = String(row.to || "").trim();
      if (!from || !to) return "";
      const code = Number(row.statusCode) === 302 ? 302 : 301;
      return `${from} ${to} ${code}`;
    })
    .filter(Boolean);

  await writeRedirects(lines);
  console.log(`Generated dist/_redirects with ${lines.length} rule(s).`);
}

run().catch(async (err) => {
  console.error("Failed generating dist/_redirects:", err);
  await writeRedirects([]);
  process.exit(1);
});
