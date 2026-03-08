import { useMemo, useState } from "react";
import { Button, Card, Code, Flex, Stack, Text } from "@sanity/ui";
import { useClient } from "sanity";

type CsvRow = Record<string, string>;
type StudioEnv = {
  SANITY_STUDIO_COVER_WORKER_URL?: string;
  SANITY_STUDIO_COVER_WORKER_TOKEN?: string;
};

function parseCsvRfc4180(text: string): { header: string[]; rows: CsvRow[] } {
  const allRows: string[][] = [];
  let row: string[] = [];
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
      allRows.push(row);
      row = [];
      field = "";
      i += 1;
      continue;
    }
    if (ch === "\r" && next === "\n") {
      row.push(field);
      allRows.push(row);
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
    allRows.push(row);
  }

  const header = (allRows[0] || []).map((h) => h.trim());
  const rows = allRows.slice(1).map((r) => {
    const obj: CsvRow = {};
    header.forEach((h, idx) => {
      obj[h] = String(r[idx] || "");
    });
    return obj;
  });
  return { header, rows };
}

function toSlug(value: string): string {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function words(text: string): number {
  return String(text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function buildCoverPrompt(rewriteTitle: string, rewriteExcerpt: string, rewriteBody: string): string {
  const excerpt = rewriteExcerpt.replace(/\s+/g, " ").trim();
  const body = rewriteBody.replace(/\s+/g, " ").trim();
  const bodySnippet = body.split(" ").slice(0, 40).join(" ");
  return [
    "Cinematic editorial realism, single scene, 16:9.",
    `Article: ${rewriteTitle}.`,
    `Why it matters: ${excerpt}.`,
    `Context: ${bodySnippet}.`,
    "Modern tech setting, clear subject focus, no text overlay, no logos, no watermark, no split-screen, no collage.",
  ].join(" ");
}

export function NewsImportPane() {
  const client = useClient({ apiVersion: "2024-01-01" });
  const [file, setFile] = useState<File | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [summary, setSummary] = useState<{ created: number; updated: number; skipped: number } | null>(null);

  const env = import.meta.env as unknown as StudioEnv;
  const workerUrl = useMemo(() => (env.SANITY_STUDIO_COVER_WORKER_URL || "").trim(), [env.SANITY_STUDIO_COVER_WORKER_URL]);
  const workerToken = useMemo(
    () => (env.SANITY_STUDIO_COVER_WORKER_TOKEN || "").trim(),
    [env.SANITY_STUDIO_COVER_WORKER_TOKEN],
  );

  const pushLog = (line: string) => setLogs((prev) => [...prev, line]);

  const runImport = async () => {
    if (!file) return;
    setIsRunning(true);
    setLogs([]);
    setSummary(null);

    try {
      const raw = await file.text();
      const { header, rows } = parseCsvRfc4180(raw);
      const required = ["sourceId", "rewriteTitle", "rewriteExcerpt", "rewriteBody", "approval"];
      const missing = required.filter((k) => !header.includes(k));
      if (missing.length) {
        throw new Error(`CSV missing required columns: ${missing.join(", ")}`);
      }

      let created = 0;
      let updated = 0;
      let skipped = 0;

      for (const row of rows) {
        const sourceId = String(row.sourceId || "").trim();
        const rewriteTitle = String(row.rewriteTitle || "").trim();
        const rewriteExcerpt = String(row.rewriteExcerpt || "").trim();
        const rewriteBody = String(row.rewriteBody || "").replace(/\s+/g, " ").trim();
        const approval = String(row.approval || "").trim().toLowerCase();

        if (!sourceId || !rewriteTitle || !rewriteExcerpt || !rewriteBody || approval !== "approved") {
          skipped += 1;
          pushLog(`Skipped row (sourceId=${sourceId || "missing"})`);
          continue;
        }

        const sourceNews = await client.fetch(
          `*[_type == "sourceNewsItem" && sourceId == $sourceId][0]{_id,sourceUrl}`,
          { sourceId },
        );
        const sourceNewsId = sourceNews?._id as string | undefined;
        const sourceUrl = String(row.sourceUrl || sourceNews?.sourceUrl || "").trim();
        const noteId = `news-note-${sourceId}`;
        const draftId = `drafts.${noteId}`;
        const slugBase = toSlug(rewriteTitle) || `news-${sourceId}`;
        const slug = `${slugBase}-${sourceId.slice(0, 6)}`.slice(0, 96);

        let coverRef: { _type: "reference"; _ref: string } | undefined;
        if (workerUrl && workerToken) {
          const prompt = buildCoverPrompt(rewriteTitle, rewriteExcerpt, rewriteBody);
          const genResponse = await fetch(`${workerUrl.replace(/\/+$/, "")}/generate`, {
            method: "POST",
            headers: {
              authorization: `Bearer ${workerToken}`,
              "content-type": "application/json",
            },
            body: JSON.stringify({
              sourceId,
              prompt,
              allowBranding: false,
            }),
          });
          if (genResponse.ok) {
            const imageResponse = await fetch(`${workerUrl.replace(/\/+$/, "")}/image-any/${encodeURIComponent(sourceId)}`);
            if (imageResponse.ok) {
              const blob = await imageResponse.blob();
              const asset = await client.assets.upload("image", blob, {
                filename: `${sourceId}-${Date.now()}.png`,
                contentType: "image/png",
              });
              coverRef = { _type: "reference", _ref: asset._id };
            } else {
              pushLog(`Cover fetch failed for ${sourceId} (${imageResponse.status})`);
            }
          } else {
            const detail = await genResponse.text().catch(() => "");
            pushLog(`Cover generation failed for ${sourceId} (${genResponse.status}) ${detail.slice(0, 120)}`);
          }
        } else {
          pushLog(`Cover skipped for ${sourceId} (worker env missing in Studio)`);
        }

        const existingDraft = await client.fetch(`*[_id == $id][0]{_id}`, { id: draftId });
        await client.createOrReplace({
          _id: draftId,
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
          workflowStatus: "draft",
          readTimeMinutes: Math.max(1, Math.min(20, Math.ceil(words(rewriteBody) / 180))),
          cover: coverRef ? { _type: "image", asset: coverRef } : undefined,
        });

        if (sourceNewsId) {
          await client
            .patch(sourceNewsId)
            .set({
              status: "imported",
              importedAt: new Date().toISOString(),
            })
            .unset(["importedNoteRef"])
            .commit();
        }

        if (existingDraft?._id) {
          updated += 1;
          pushLog(`Updated draft: ${draftId}`);
        } else {
          created += 1;
          pushLog(`Created draft: ${draftId}`);
        }
      }

      setSummary({ created, updated, skipped });
      pushLog("Import completed.");
    } catch (error) {
      pushLog(`Failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card padding={4}>
      <Stack space={4}>
        <Text size={3} weight="semibold">
          Import Rewritten CSV - Draft Posts + Covers
        </Text>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
          disabled={isRunning}
        />
        <Flex gap={3}>
          <Button text={isRunning ? "Importing..." : "Run Import"} tone="primary" onClick={runImport} disabled={!file || isRunning} />
        </Flex>
        {summary && (
          <Card tone="positive" padding={3} radius={2}>
            <Text size={2}>
              Created: {summary.created} | Updated: {summary.updated} | Skipped: {summary.skipped}
            </Text>
          </Card>
        )}
        <Card tone="transparent" border padding={3} style={{ maxHeight: 320, overflow: "auto" }}>
          <Stack space={2}>
            {logs.length === 0 ? <Text size={1}>No logs yet.</Text> : logs.map((line, idx) => <Code key={`${idx}-${line}`}>{line}</Code>)}
          </Stack>
        </Card>
      </Stack>
    </Card>
  );
}
