const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { Readable } = require("node:stream");
const { getCliClient } = require("sanity/cli");

const client = getCliClient({ apiVersion: "2024-01-01", useCdn: false });

function parseArgs(argv) {
  const args = {
    file: "",
    workflowStatus: process.env.IMPORT_WORKFLOW_STATUS || "draft",
    attachCovers: true,
    generateCovers: true,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if ((token === "--file" || token === "-f") && argv[i + 1]) {
      args.file = argv[i + 1];
      i += 1;
      continue;
    }
    if (token === "--workflow-status" && argv[i + 1]) {
      args.workflowStatus = argv[i + 1];
      i += 1;
      continue;
    }
    if (token === "--no-covers") {
      args.attachCovers = false;
    }
    if (token === "--no-generate-covers") {
      args.generateCovers = false;
    }
  }
  return args;
}

function parseCsvRfc4180(text) {
  const rows = [];
  let row = [];
  let field = "";
  let i = 0;
  let inQuotes = false;

  while (i < text.length) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i += 2;
        continue;
      }
      if (ch === '"') {
        inQuotes = false;
        i += 1;
        continue;
      }
      field += ch;
      i += 1;
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (ch === ",") {
      row.push(field);
      field = "";
      i += 1;
      continue;
    }
    if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i += 1;
      continue;
    }
    if (ch === "\r" && next === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i += 2;
      continue;
    }
    field += ch;
    i += 1;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  if (!rows.length) return { header: [], items: [] };
  const header = rows[0].map((h) => h.trim());
  const items = rows.slice(1).filter((r) => r.some((v) => String(v || "").trim() !== ""));
  return { header, items };
}

function toObject(header, row) {
  const out = {};
  for (let i = 0; i < header.length; i += 1) out[header[i]] = row[i] || "";
  return out;
}

function toSlug(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function words(text) {
  return String(text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

async function uploadCoverIfExists(sourceId) {
  const workerUrl = process.env.COVER_WORKER_URL || "https://qv-internal-image-worker.quantizedvision.workers.dev";
  const url = `${workerUrl.replace(/\/+$/, "")}/image-any/${encodeURIComponent(sourceId)}`;
  const response = await fetch(url);
  if (!response.ok) return null;
  const bytes = Buffer.from(await response.arrayBuffer());
  if (!bytes.length) return null;
  const hash = crypto.createHash("sha1").update(bytes).digest("hex").slice(0, 12);
  const filename = `${sourceId}-${hash}.png`;
  const asset = await client.assets.upload("image", Readable.from(bytes), { filename, contentType: "image/png" });
  return asset?._id || null;
}

function buildCoverPrompt({ rewriteTitle, rewriteExcerpt, rewriteBody }) {
  const excerpt = String(rewriteExcerpt || "").replace(/\s+/g, " ").trim();
  const body = String(rewriteBody || "").replace(/\s+/g, " ").trim();
  const bodySnippet = body.split(" ").slice(0, 40).join(" ");
  return [
    "Cinematic editorial realism, single scene, 16:9.",
    `Article: ${rewriteTitle}.`,
    `Why it matters: ${excerpt}.`,
    `Context: ${bodySnippet}.`,
    "Modern tech setting, clear subject focus, no text overlay, no logos, no watermark, no split-screen, no collage.",
  ].join(" ");
}

async function generateCover({ sourceId, rewriteTitle, rewriteExcerpt, rewriteBody }) {
  const workerUrl = process.env.COVER_WORKER_URL || "https://qv-internal-image-worker.quantizedvision.workers.dev";
  const token = process.env.COVER_WORKER_TOKEN || process.env.INTERNAL_IMAGE_WORKER_TOKEN || "";
  if (!token) {
    return { ok: false, reason: "missing_worker_token" };
  }

  const prompt = buildCoverPrompt({ rewriteTitle, rewriteExcerpt, rewriteBody });
  const response = await fetch(`${workerUrl.replace(/\/+$/, "")}/generate`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sourceId,
      prompt,
      allowBranding: false,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    return { ok: false, reason: `generate_failed_${response.status}`, detail: text.slice(0, 300) };
  }
  return { ok: true };
}

async function run() {
  const args = parseArgs(process.argv);
  if (!args.file) throw new Error("Missing --file <csv-path>");
  const absoluteFile = path.resolve(args.file);
  const raw = fs.readFileSync(absoluteFile, "utf8");
  const { header, items } = parseCsvRfc4180(raw);
  if (!header.length) throw new Error("CSV header missing");

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let generatedCovers = 0;
  const results = [];

  for (const row of items) {
    const doc = toObject(header, row);
    const sourceId = String(doc.sourceId || "").trim();
    const rewriteTitle = String(doc.rewriteTitle || "").trim();
    const rewriteExcerpt = String(doc.rewriteExcerpt || "").trim();
    const rewriteBody = String(doc.rewriteBody || "").replace(/\s+/g, " ").trim();
    const approval = String(doc.approval || "").trim().toLowerCase();
    const sourceUrlFromCsv = String(doc.sourceUrl || "").trim();

    if (!sourceId || !rewriteTitle || !rewriteExcerpt || !rewriteBody || approval !== "approved") {
      skipped += 1;
      results.push({ sourceId: sourceId || null, status: "skipped" });
      continue;
    }

    const sourceNews = await client.fetch(
      `*[_type == "sourceNewsItem" && sourceId == $sourceId][0]{_id,sourceUrl}`,
      { sourceId },
    );
    const sourceNewsId = sourceNews?._id || null;
    const sourceUrl = sourceUrlFromCsv || sourceNews?.sourceUrl || "";
    const noteId = `news-note-${sourceId}`;
    const slugBase = toSlug(rewriteTitle) || `news-${sourceId}`;
    const slug = `${slugBase}-${sourceId.slice(0, 6)}`.slice(0, 96);

    let coverAssetId = null;
    let coverGenerationStatus = "skipped";
    if (args.generateCovers) {
      const generated = await generateCover({ sourceId, rewriteTitle, rewriteExcerpt, rewriteBody });
      if (generated.ok) {
        generatedCovers += 1;
        coverGenerationStatus = "generated";
      } else {
        coverGenerationStatus = generated.reason || "failed";
      }
    }

    if (args.attachCovers) {
      coverAssetId = await uploadCoverIfExists(sourceId);
    }

    const payload = {
      _type: "note",
      title: rewriteTitle,
      slug: { _type: "slug", current: slug },
      date: new Date().toISOString().slice(0, 10),
      excerpt: rewriteExcerpt,
      body: rewriteBody,
      sourceId,
      sourceUrl,
      sourceNewsRef: sourceNewsId ? { _type: "reference", _ref: sourceNewsId.replace(/^drafts\./, "") } : undefined,
      featured: false,
      workflowStatus: args.workflowStatus,
      readTimeMinutes: Math.max(1, Math.min(20, Math.ceil(words(rewriteBody) / 180))),
      cover: coverAssetId ? { _type: "image", asset: { _type: "reference", _ref: coverAssetId } } : undefined,
    };

    const draftNoteId = `drafts.${noteId}`;
    const existingDraft = await client.fetch(`*[_id == $id][0]{_id}`, {
      id: draftNoteId,
    });

    await client.createOrReplace({ _id: draftNoteId, ...payload });

    if (existingDraft?._id) {
      updated += 1;
      results.push({
        sourceId,
        status: "updated",
        noteId: draftNoteId,
        cover: Boolean(coverAssetId),
        coverGenerationStatus,
      });
    } else {
      created += 1;
      results.push({
        sourceId,
        status: "created",
        noteId: draftNoteId,
        cover: Boolean(coverAssetId),
        coverGenerationStatus,
      });
    }

    if (sourceNewsId) {
      const queueStatus =
        args.workflowStatus === "published"
          ? "published"
          : args.workflowStatus === "draft" || args.workflowStatus === "review"
            ? "imported"
            : "needs_approval";
      const queuePatch = {
        status: queueStatus,
        importedAt: new Date().toISOString(),
      };
      if (args.workflowStatus === "published") {
        queuePatch.importedNoteRef = { _type: "reference", _ref: noteId };
      }
      await client
        .patch(sourceNewsId)
        .set(queuePatch)
        .unset(args.workflowStatus === "published" ? [] : ["importedNoteRef"])
        .commit();
    }
  }

  console.log(
    JSON.stringify(
      {
        file: absoluteFile,
        workflowStatus: args.workflowStatus,
        attachCovers: args.attachCovers,
        totals: { rows: items.length, created, updated, skipped },
        covers: { generated: generatedCovers },
        results,
      },
      null,
      2,
    ),
  );
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
