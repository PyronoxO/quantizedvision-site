import { useMemo, useState } from "react";
import { Button, Card, Code, Stack, Text } from "@sanity/ui";
import { useClient } from "sanity";

type DraftNote = {
  _id: string;
  sourceId?: string;
  title?: string;
  workflowStatus?: string;
};

type PublishSummary = {
  published: number;
  failed: number;
};

function stripSystemFields<T extends Record<string, unknown>>(doc: T): T {
  const next = { ...doc };
  delete next._rev;
  delete next._updatedAt;
  delete next._createdAt;
  return next;
}

export function BulkPublishPane() {
  const client = useClient({ apiVersion: "2024-01-01" });
  const [isPublishing, setIsPublishing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [summary, setSummary] = useState<PublishSummary | null>(null);
  const [statusFilter, setStatusFilter] = useState<"review" | "draft">("draft");

  const pushLog = (line: string) => setLogs((prev) => [...prev, line]);

  const headline = useMemo(
    () => (statusFilter === "review" ? "Publish all posts in Review" : "Publish all posts in Draft"),
    [statusFilter],
  );

  const runPublish = async () => {
    const confirmed = window.confirm(`Publish all "${statusFilter}" draft posts now?`);
    if (!confirmed) return;

    setIsPublishing(true);
    setLogs([]);
    setSummary(null);

    try {
      const drafts = await client.fetch(
        `*[_type == "note" && workflowStatus == $status]`,
        { status: statusFilter },
      );

      const docs = drafts as DraftNote[];
      if (!docs.length) {
        pushLog(`No draft posts found with workflowStatus="${statusFilter}".`);
        setSummary({ published: 0, failed: 0 });
        return;
      }

      let published = 0;
      let failed = 0;

      for (const draft of docs) {
        try {
          const draftId = draft._id;
          const isDraftDoc = draftId.startsWith("drafts.");
          const publishedId = isDraftDoc ? draftId.replace(/^drafts\./, "") : draftId;

          if (isDraftDoc) {
            const fullDraft = await client.getDocument(draftId);
            if (!fullDraft) {
              failed += 1;
              pushLog(`Failed: missing draft ${draftId}`);
              continue;
            }

            const publishedDoc = stripSystemFields({
              ...fullDraft,
              _id: publishedId,
              workflowStatus: "published",
            });

            await client.transaction().createOrReplace(publishedDoc).delete(draftId).commit();
          } else {
            await client.patch(publishedId).set({ workflowStatus: "published" }).commit();
          }

          if (draft.sourceId) {
            const sourceNewsId = `sourceNewsItem-${draft.sourceId}`;
            await client
              .patch(sourceNewsId)
              .set({
                status: "published",
                importedAt: new Date().toISOString(),
                importedNoteRef: { _type: "reference", _ref: publishedId },
              })
              .commit();
          }

          published += 1;
          pushLog(`Published: ${publishedId}`);
        } catch (error) {
          failed += 1;
          pushLog(`Failed: ${draft._id} -> ${error instanceof Error ? error.message : "unknown error"}`);
        }
      }

      setSummary({ published, failed });
      pushLog("Bulk publish completed.");
    } catch (error) {
      pushLog(`Bulk publish failed: ${error instanceof Error ? error.message : "unknown error"}`);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Card padding={4}>
      <Stack space={4}>
        <Text size={3} weight="semibold">
          Bulk Publish
        </Text>
        <Text size={2} muted>
          Publish many draft posts at once after editorial review.
        </Text>
        <Stack space={2}>
          <Button
            text={statusFilter === "review" ? "Mode: Review only" : "Mode: Draft only"}
            mode="ghost"
            tone="default"
            onClick={() => setStatusFilter((prev) => (prev === "review" ? "draft" : "review"))}
            disabled={isPublishing}
          />
          <Button text={isPublishing ? "Publishing..." : headline} tone="primary" onClick={runPublish} disabled={isPublishing} />
        </Stack>
        {summary && (
          <Card tone="positive" padding={3} radius={2}>
            <Text size={2}>
              Published: {summary.published} | Failed: {summary.failed}
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
