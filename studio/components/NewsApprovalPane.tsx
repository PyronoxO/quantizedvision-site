import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, Flex, Stack, Text, TextInput } from "@sanity/ui";
import { useClient } from "sanity";

type QueueItem = {
  _id: string;
  sourceId?: string;
  title?: string;
  rawExcerpt?: string;
  sourceUrl?: string;
  sourceName?: string;
  status?: string;
  approvedForExport?: boolean;
  _updatedAt?: string;
};

const queueQuery = `*[_type == "sourceNewsItem" && (!defined(status) || (status != "archived" && status != "exported"))] | order(_updatedAt desc)[0..199]{
  _id,
  sourceId,
  title,
  rawExcerpt,
  sourceUrl,
  sourceName,
  status,
  approvedForExport,
  _updatedAt
}`;

function toCsvValue(value: string) {
  const normalized = value.replace(/\r?\n|\r/g, " ").trim();
  return `"${normalized.replace(/"/g, '""')}"`;
}

function formatDate(value?: string) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toISOString().slice(0, 19).replace("T", " ");
}

function timelineBucket(value?: string) {
  if (!value) return "Undated";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Undated";
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const day = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()).getTime();
  const diffDays = Math.floor((today - day) / 86400000);
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays <= 7) return "Last 7 Days";
  if (diffDays <= 30) return "Last 30 Days";
  return "Older";
}

export function NewsApprovalPane() {
  const client = useClient({ apiVersion: "2024-01-01" });
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<string>("");

  const load = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const result = await client.fetch<QueueItem[]>(queueQuery);
      setItems(result);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load queue.");
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) => {
      const haystack = `${item.title || ""} ${item.rawExcerpt || ""} ${item.sourceName || ""} ${item.sourceUrl || ""}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [items, query]);

  const approvedItems = useMemo(() => filtered.filter((item) => item.approvedForExport), [filtered]);
  const timelineGroups = useMemo(() => {
    const orderedLabels = ["Today", "Yesterday", "Last 7 Days", "Last 30 Days", "Older", "Undated"];
    const buckets = new Map<string, QueueItem[]>();
    for (const item of filtered) {
      const label = timelineBucket(item._updatedAt);
      const list = buckets.get(label) || [];
      list.push(item);
      buckets.set(label, list);
    }
    return orderedLabels
      .map((label) => ({ label, items: buckets.get(label) || [] }))
      .filter((group) => group.items.length > 0);
  }, [filtered]);

  const toggleApprove = useCallback(
    async (item: QueueItem, approved: boolean) => {
      setSubmitting(true);
      setMessage("");
      try {
        await client
          .patch(item._id)
          .set({
            approvedForExport: approved,
            status: approved ? "selected" : item.status === "selected" ? "ingested" : item.status,
          })
          .commit();
        await load();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Failed to update approval.");
      } finally {
        setSubmitting(false);
      }
    },
    [client, load],
  );

  const rejectItem = useCallback(
    async (item: QueueItem) => {
      setSubmitting(true);
      setMessage("");
      try {
        await client.patch(item._id).set({ approvedForExport: false, status: "rejected" }).commit();
        await load();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Failed to reject item.");
      } finally {
        setSubmitting(false);
      }
    },
    [client, load],
  );

  const exportApproved = useCallback(async () => {
    const exportRows = items.filter((item) => item.approvedForExport);
    if (exportRows.length === 0) {
      setMessage("No approved rows to export.");
      return;
    }

    setSubmitting(true);
    setMessage("");
    try {
      const header = [
        "sourceId",
        "title",
        "sourceUrl",
        "rawExcerpt",
        "sourceName",
        "_updatedAt",
        "rewriteTitle",
        "rewriteExcerpt",
        "rewriteBody",
        "approval",
      ];

      const lines = [header.join(",")];
      for (const row of exportRows) {
        lines.push(
          [
            toCsvValue(row.sourceId || ""),
            toCsvValue(row.title || ""),
            toCsvValue(row.sourceUrl || ""),
            toCsvValue(row.rawExcerpt || ""),
            toCsvValue(row.sourceName || ""),
            toCsvValue(row._updatedAt || ""),
            toCsvValue(""),
            toCsvValue(""),
            toCsvValue(""),
            toCsvValue("approved"),
          ].join(","),
        );
      }

      const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      link.href = url;
      link.download = `news-approved-${stamp}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      const tx = client.transaction();
      const now = new Date().toISOString();
      for (const row of exportRows) {
        tx.patch(row._id, {
          set: {
            status: "exported",
            exportedAt: now,
            approvedForExport: false,
          },
        });
      }
      await tx.commit();
      await load();
      setMessage(`Exported ${exportRows.length} approved row(s).`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to export approved rows.");
    } finally {
      setSubmitting(false);
    }
  }, [client, items, load]);

  return (
    <Stack space={4} padding={4}>
      <Card padding={3} radius={2} tone="transparent" border>
        <Stack space={3}>
          <Flex align="center" justify="space-between">
            <Text weight="semibold">News Approval Queue</Text>
            <Flex gap={2}>
              <Button text="Refresh" mode="ghost" onClick={load} disabled={loading || submitting} />
              <Button
                text={`Approve + Export (${items.filter((item) => item.approvedForExport).length})`}
                tone="primary"
                onClick={exportApproved}
                disabled={submitting}
              />
            </Flex>
          </Flex>
          <TextInput
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="Filter by headline, excerpt, source..."
          />
          <Text size={1} muted>
            Visible: {filtered.length} | Approved in filter: {approvedItems.length}
          </Text>
          {message ? <Text size={1}>{message}</Text> : null}
        </Stack>
      </Card>

      {timelineGroups.map((group) => (
        <Stack key={group.label} space={3}>
          <Flex align="center" justify="space-between">
            <Text size={1} weight="semibold" muted>
              {group.label}
            </Text>
            <Text size={1} muted>
              {group.items.length} item{group.items.length === 1 ? "" : "s"}
            </Text>
          </Flex>
          {group.items.map((item) => (
            <Card key={item._id} padding={3} radius={2} border tone="transparent">
              <Stack space={2}>
                <Flex align="center" justify="space-between" gap={3}>
                  <Text weight="medium">{item.title || "Untitled"}</Text>
                  <Text size={1} muted>
                    {item.status || "ingested"}
                  </Text>
                </Flex>
                <Text size={1} muted>
                  {item.rawExcerpt || ""}
                </Text>
                <Text size={1} muted>
                  {item.sourceName || "Unknown source"} · {formatDate(item._updatedAt)}
                </Text>
                <Flex gap={2}>
                  {item.approvedForExport ? (
                    <Button text="Approved" tone="positive" mode="default" onClick={() => toggleApprove(item, false)} disabled={submitting} />
                  ) : (
                    <Button text="Approve" tone="primary" mode="default" onClick={() => toggleApprove(item, true)} disabled={submitting} />
                  )}
                  <Button text="Reject" tone="critical" mode="ghost" onClick={() => rejectItem(item)} disabled={submitting} />
                  {item.sourceUrl ? (
                    <Button
                      text="Open Source"
                      mode="ghost"
                      as="a"
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                    />
                  ) : null}
                </Flex>
              </Stack>
            </Card>
          ))}
        </Stack>
      ))}
    </Stack>
  );
}
