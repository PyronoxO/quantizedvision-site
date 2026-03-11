import { useEffect, useMemo, useState } from "react";
import { Button, Card, Checkbox, Code, Flex, Grid, Heading, Inline, Stack, Text } from "@sanity/ui";
import { useClient } from "sanity";

type ArtworkRow = {
  _id: string;
  title?: string;
  externalUrl?: string;
  externalThumbnail?: string;
  cover?: { asset?: { _ref?: string } };
};

type NoteRow = {
  _id: string;
  title?: string;
  slug?: string;
  workflowStatus?: string;
  date?: string;
};

type OEmbedPayload = {
  title?: string;
  author_name?: string;
  provider_name?: string;
  thumbnail_url?: string;
};

function toShortTitle(raw?: string): string {
  if (!raw) return "";
  const noUrls = raw.replace(/https?:\/\/\S+/gi, " ");
  const beforeHashtags = noUrls.split("#")[0] || noUrls;
  const compact = beforeHashtags.replace(/\s+/g, " ").trim();
  if (!compact) return "";
  return compact.length > 64 ? `${compact.slice(0, 64).trim()}...` : compact;
}

function artworkListTitle(raw?: string, fallbackId?: string): string {
  const cleaned = toShortTitle(raw);
  if (cleaned) return cleaned;
  return fallbackId || "Untitled external artwork";
}

function resolvePrimaryEndpoints(url: string): string[] {
  const lowered = url.toLowerCase();
  if (lowered.includes("tiktok.com")) {
    return [
      `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
      `https://noembed.com/embed?url=${encodeURIComponent(url)}`,
    ];
  }
  if (lowered.includes("youtube.com") || lowered.includes("youtu.be")) {
    return [
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
      `https://noembed.com/embed?url=${encodeURIComponent(url)}`,
    ];
  }
  if (lowered.includes("instagram.com")) {
    return [
      `https://www.instagram.com/oembed?url=${encodeURIComponent(url)}&omitscript=true`,
      `https://noembed.com/embed?url=${encodeURIComponent(url)}`,
    ];
  }
  return [`https://noembed.com/embed?url=${encodeURIComponent(url)}`];
}

async function fetchFirstWorkingPayload(url: string): Promise<OEmbedPayload | null> {
  const endpoints = resolvePrimaryEndpoints(url);
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint);
      if (!response.ok) continue;
      const payload = (await response.json()) as OEmbedPayload;
      if (payload.title || payload.thumbnail_url || payload.author_name || payload.provider_name) return payload;
    } catch {
      // continue
    }
  }
  return null;
}

function baseId(id: string): string {
  return id.replace(/^drafts\./, "");
}

export function BulkOperationsPane() {
  const client = useClient({ apiVersion: "2024-01-01" });
  const [artworks, setArtworks] = useState<ArtworkRow[]>([]);
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [selectedArtworkIds, setSelectedArtworkIds] = useState<Set<string>>(new Set());
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(new Set());
  const [isBusy, setIsBusy] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const log = (line: string) => setLogs((prev) => [...prev, line]);

  const loadData = async () => {
    const [artworkRows, noteRows] = await Promise.all([
      client.fetch<ArtworkRow[]>(
        `*[_type == "artwork" && mediaType == "external"] | order(date desc)[0...400]{
          _id,title,externalUrl,externalThumbnail,cover
        }`,
      ),
      client.fetch<NoteRow[]>(
        `*[_type == "note"] | order(date desc)[0...500]{
          _id,title,"slug":slug.current,workflowStatus,date
        }`,
      ),
    ]);

    const noteByBase = new Map<string, NoteRow>();
    for (const row of noteRows || []) {
      const id = row._id || "";
      const key = baseId(id);
      const existing = noteByBase.get(key);
      if (!existing) {
        noteByBase.set(key, row);
        continue;
      }
      const existingIsDraft = existing._id.startsWith("drafts.");
      const currentIsDraft = id.startsWith("drafts.");
      if (!existingIsDraft && currentIsDraft) noteByBase.set(key, row);
    }

    setArtworks((artworkRows || []).filter((row) => Boolean(row.externalUrl)));
    setNotes(Array.from(noteByBase.values()));
    setSelectedArtworkIds(new Set());
    setSelectedNoteIds(new Set());
  };

  useEffect(() => {
    loadData().catch((error) => {
      log(`Load failed: ${error instanceof Error ? error.message : "unknown error"}`);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const artworkIds = useMemo(() => artworks.map((row) => row._id), [artworks]);
  const noteIds = useMemo(() => notes.map((row) => row._id), [notes]);
  const selectedArtworks = useMemo(() => artworks.filter((row) => selectedArtworkIds.has(row._id)), [artworks, selectedArtworkIds]);
  const selectedNotes = useMemo(() => notes.filter((row) => selectedNoteIds.has(row._id)), [notes, selectedNoteIds]);
  const artworkMissingCoverIds = useMemo(
    () => artworks.filter((row) => !row.cover?.asset?._ref).map((row) => row._id),
    [artworks],
  );

  const toggleArtwork = (id: string) =>
    setSelectedArtworkIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleNote = (id: string) =>
    setSelectedNoteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const setAllArtworks = (checked: boolean) => setSelectedArtworkIds(checked ? new Set(artworkIds) : new Set());
  const selectMissingArtworkCovers = () => setSelectedArtworkIds(new Set(artworkMissingCoverIds));
  const setAllNotes = (checked: boolean) => setSelectedNoteIds(checked ? new Set(noteIds) : new Set());

  const runFetchMetadata = async (scope: "selected" | "all") => {
    const rows = scope === "all" ? artworks : selectedArtworks;
    if (!rows.length) return;
    setIsBusy(true);
    setLogs([]);
    let ok = 0;
    let failed = 0;
    try {
      for (const row of rows) {
        const externalUrl = (row.externalUrl || "").trim();
        if (!externalUrl) continue;
        try {
          const payload = await fetchFirstWorkingPayload(externalUrl);
          if (!payload) throw new Error("oEmbed unavailable");
          const setPatch: Record<string, unknown> = { mediaType: "external" };
          const compactTitle = toShortTitle(payload.title);
          if (compactTitle && (!row.title || row.title.toLowerCase() === "untitled")) setPatch.title = compactTitle;
          if (payload.thumbnail_url) {
            setPatch.externalThumbnail = payload.thumbnail_url;
            try {
              const imageResponse = await fetch(payload.thumbnail_url);
              if (imageResponse.ok) {
                const blob = await imageResponse.blob();
                const asset = await client.assets.upload("image", blob, {
                  filename: `${baseId(row._id)}-external-thumb.jpg`,
                  contentType: blob.type || "image/jpeg",
                });
                setPatch.cover = {
                  _type: "image",
                  asset: { _type: "reference", _ref: asset._id },
                };
              }
            } catch {
              // keep URL patch even if upload fails
            }
          }
          await client.patch(row._id).set(setPatch).commit();
          ok += 1;
          log(`Metadata updated: ${row.title || row._id}`);
        } catch (error) {
          failed += 1;
          log(`Metadata failed: ${row.title || row._id} -> ${error instanceof Error ? error.message : "unknown error"}`);
        }
      }
      log(`Metadata done. OK: ${ok}, Failed: ${failed}`);
      await loadData();
    } finally {
      setIsBusy(false);
    }
  };

  const setSelectedPostStatus = async (target: "draft" | "published") => {
    if (!selectedNotes.length) return;
    setIsBusy(true);
    setLogs([]);
    let ok = 0;
    let failed = 0;
    try {
      for (const note of selectedNotes) {
        try {
          const id = note._id;
          const isDraftDoc = id.startsWith("drafts.");
          const publishedId = baseId(id);
          if (target === "published" && isDraftDoc) {
            const draftDoc = await client.getDocument(id);
            if (!draftDoc) throw new Error("missing draft");
            const publishDoc = { ...draftDoc, _id: publishedId, workflowStatus: "published" } as Record<string, unknown>;
            delete publishDoc._rev;
            delete publishDoc._updatedAt;
            delete publishDoc._createdAt;
            await client.transaction().createOrReplace(publishDoc).delete(id).commit();
          } else {
            const patchId = isDraftDoc ? id : publishedId;
            await client.patch(patchId).set({ workflowStatus: target }).commit();
          }
          ok += 1;
          log(`Status -> ${target}: ${note.title || id}`);
        } catch (error) {
          failed += 1;
          log(`Status failed: ${note.title || note._id} -> ${error instanceof Error ? error.message : "unknown error"}`);
        }
      }
      log(`Status update done. OK: ${ok}, Failed: ${failed}`);
      await loadData();
    } finally {
      setIsBusy(false);
    }
  };

  const deleteSelectedPosts = async () => {
    if (!selectedNotes.length) return;
    if (!window.confirm(`Delete ${selectedNotes.length} selected post(s)? This cannot be undone.`)) return;
    setIsBusy(true);
    setLogs([]);
    let ok = 0;
    let failed = 0;
    try {
      for (const note of selectedNotes) {
        try {
          const id = note._id;
          const rootId = baseId(id);
          await client.transaction().delete(rootId).delete(`drafts.${rootId}`).commit();
          ok += 1;
          log(`Deleted: ${note.title || rootId}`);
        } catch (error) {
          failed += 1;
          log(`Delete failed: ${note.title || note._id} -> ${error instanceof Error ? error.message : "unknown error"}`);
        }
      }
      log(`Delete done. OK: ${ok}, Failed: ${failed}`);
      await loadData();
    } finally {
      setIsBusy(false);
    }
  };

  const getPostUrl = (note: NoteRow) => {
    const base = ((import.meta as any).env?.SANITY_STUDIO_PUBLIC_SITE_URL as string | undefined) || "https://quantizedvision.com";
    const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
    return note.slug ? `${cleanBase}/posts/${note.slug}` : "";
  };

  const shareSingleSelectedPost = async (platform: "x" | "linkedin" | "facebook") => {
    if (selectedNotes.length !== 1) {
      log("Select exactly one post for sharing.");
      return;
    }
    const row = selectedNotes[0];
    const postUrl = getPostUrl(row);
    if (!postUrl) {
      log("Selected post has no slug. Cannot build share link.");
      return;
    }
    const shareText = `${(row.title || "Quantized Vision post").trim()} — Quantized Vision`;
    const shareUrl =
      platform === "x"
        ? `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(postUrl)}`
        : platform === "linkedin"
          ? `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(`${shareText} ${postUrl}`)}`
          : "https://www.facebook.com/";
    if (platform === "facebook") {
      try {
        await navigator.clipboard.writeText(`${shareText} ${postUrl}`);
        log("Copied Facebook share link for selected post.");
      } catch {
        log("Clipboard copy failed for Facebook share link.");
      }
    }
    const opened = window.open(shareUrl, "_blank", "noopener,noreferrer");
    if (!opened) log(`Popup blocked for ${platform}.`);
  };

  return (
    <Card padding={4}>
      <Stack space={5}>
        <Flex align="center" justify="space-between">
          <Heading size={2}>Bulk Operations</Heading>
          <Button text="Refresh Lists" mode="ghost" onClick={() => loadData()} disabled={isBusy} />
        </Flex>

        <Grid columns={[1, 1, 2]} gap={4}>
          <Card padding={3} border radius={2}>
            <Stack space={3}>
              <Text weight="semibold">External Artwork Metadata</Text>
              <Inline space={3}>
                <Checkbox checked={artworkIds.length > 0 && selectedArtworkIds.size === artworkIds.length} onChange={(e) => setAllArtworks(e.currentTarget.checked)} />
                <Text size={1}>Select all external artworks ({artworkIds.length})</Text>
              </Inline>
              <Inline space={2}>
                <Button
                  text={`Select Missing Cover Only (${artworkMissingCoverIds.length})`}
                  mode="ghost"
                  onClick={selectMissingArtworkCovers}
                  disabled={isBusy || artworkMissingCoverIds.length === 0}
                />
              </Inline>
              <Card padding={2} border radius={2} style={{ maxHeight: 260, overflow: "auto" }}>
                <Stack space={2}>
                  {artworks.map((row) => (
                    <Inline key={row._id} space={2}>
                      <Checkbox checked={selectedArtworkIds.has(row._id)} onChange={() => toggleArtwork(row._id)} />
                      <Text size={1}>{artworkListTitle(row.title, row._id)}</Text>
                    </Inline>
                  ))}
                  {artworks.length === 0 ? <Text size={1}>No external artworks found.</Text> : null}
                </Stack>
              </Card>
              <Inline space={2}>
                <Button text="Fetch Metadata (Selected)" tone="primary" onClick={() => runFetchMetadata("selected")} disabled={isBusy || selectedArtworkIds.size === 0} />
                <Button text="Fetch Metadata (All)" mode="ghost" onClick={() => runFetchMetadata("all")} disabled={isBusy || artworks.length === 0} />
              </Inline>
            </Stack>
          </Card>

          <Card padding={3} border radius={2}>
            <Stack space={3}>
              <Text weight="semibold">Posts</Text>
              <Inline space={3}>
                <Checkbox checked={noteIds.length > 0 && selectedNoteIds.size === noteIds.length} onChange={(e) => setAllNotes(e.currentTarget.checked)} />
                <Text size={1}>Select all posts ({noteIds.length})</Text>
              </Inline>
              <Card padding={2} border radius={2} style={{ maxHeight: 260, overflow: "auto" }}>
                <Stack space={2}>
                  {notes.map((row) => (
                    <Inline key={row._id} space={2}>
                      <Checkbox checked={selectedNoteIds.has(row._id)} onChange={() => toggleNote(row._id)} />
                      <Text size={1}>
                        {row.title || row._id} [{row.workflowStatus || "published"}]
                      </Text>
                    </Inline>
                  ))}
                  {notes.length === 0 ? <Text size={1}>No posts found.</Text> : null}
                </Stack>
              </Card>
              <Inline space={2}>
                <Button text="Set Draft" mode="ghost" onClick={() => setSelectedPostStatus("draft")} disabled={isBusy || selectedNoteIds.size === 0} />
                <Button text="Set Published" tone="primary" onClick={() => setSelectedPostStatus("published")} disabled={isBusy || selectedNoteIds.size === 0} />
                <Button text="Delete Selected" tone="critical" mode="ghost" onClick={deleteSelectedPosts} disabled={isBusy || selectedNoteIds.size === 0} />
              </Inline>
              <Inline space={2}>
                <Button text="Share on X" mode="ghost" onClick={() => shareSingleSelectedPost("x")} disabled={isBusy || selectedNoteIds.size !== 1} />
                <Button text="Share on LinkedIn" mode="ghost" onClick={() => shareSingleSelectedPost("linkedin")} disabled={isBusy || selectedNoteIds.size !== 1} />
                <Button text="Share on Facebook" mode="ghost" onClick={() => shareSingleSelectedPost("facebook")} disabled={isBusy || selectedNoteIds.size !== 1} />
              </Inline>
              <Text size={1} muted>
                Select exactly one post to share from here.
              </Text>
            </Stack>
          </Card>
        </Grid>

        <Card tone="transparent" border padding={3} style={{ maxHeight: 280, overflow: "auto" }}>
          <Stack space={2}>
            {logs.length === 0 ? <Text size={1}>No logs yet.</Text> : logs.map((line, idx) => <Code key={`${idx}-${line}`}>{line}</Code>)}
          </Stack>
        </Card>
      </Stack>
    </Card>
  );
}
