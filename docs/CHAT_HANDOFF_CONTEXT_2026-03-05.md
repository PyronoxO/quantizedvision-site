# Quantized Vision - Chat Handoff Context (Updated 2026-03-06)

## 1) Project Overview
- Stack: Astro frontend + Sanity Studio CMS.
- Deployment: Cloudflare via `main` branch pushes.
- Current focus: AI/tech news ingestion, curation, rewrite pipeline, and approval workflow.

## 2) Confirmed Current State
- Mobile menu lag issue was fixed and user confirmed it works.
- Make.com ingestion workflow is live and writes queue docs to Sanity.
- Sanity queue docs count verified from CLI during this session: 51 `sourceNewsItem` docs (all ingested at check time).
- Studio now exposes news queue and approval tooling.

## 3) What Is Implemented (Code)
- Added news queue schema:
  - `studio/schemaTypes/sourceNewsItemType.ts`
- Registered and surfaced in Studio:
  - `studio/schemaTypes/index.ts`
  - `studio/deskStructure.ts`
- Added queue lifecycle/status support:
  - `ingested`, `selected`, `exported`, `imported`, `needs_approval`, `published`, `rejected`, `archived`
- Added queue helper fields:
  - `approvedForExport` (bool)
  - `exportedAt` (datetime)
  - `importedNoteRef` (ref to `note`)
  - `importedAt` (datetime)
- Extended `note` schema for rewritten imports:
  - `body` (text)
  - `sourceUrl`, `sourceId`, `sourceNewsRef`
  - File: `studio/schemaTypes/noteType.ts`
- Updated note query to include added fields:
  - `src/lib/queries.ts`

## 4) What Is Implemented (Studio UX)
- New top-level Studio tool: `Approval Board`.
- File: `studio/components/NewsApprovalPane.tsx`
- Behavior:
  - Shows queue rows (headline/excerpt/source/status).
  - Per-row actions: `Approve`, `Reject`, `Open Source`.
  - Top action: `Approve + Export (N)`.
  - Exports approved rows as CSV file to local download.
  - Marks exported queue items as `status=exported` and sets `exportedAt`.
- Navigation updated so Approval Board is top-level for wider workspace (not nested).

## 5) Make.com Workflows (Current)
- Ingestion scenario: implemented and running.
  - Start: `Tools > Set multiple variables` (scheduled start)
  - Router with 3 RSS branches
  - Each branch upserts to Sanity `sourceNewsItem`
- Export pipeline with CSV + Dropbox was also configured and validated.
- Known mapping issue discovered and resolved during session:
  - Iterator had to target array (`Data.result`), not full `Data` object.

## 6) Current Product Logic (Agreed)
- User does not want opening items one-by-one in document editor.
- Curation happens from Approval Board list rows.
- “Not approved” is effectively “not selected.”
- Export is batch-only via `Approve + Export (N)`.
- Rewrite happens externally (ChatGPT web workflow).
- Import of rewritten content goes into Sanity `Posts` as `workflowStatus=review`.
- Final publish approval happens in Sanity `Posts`.

## 7) Open Work / Next Steps
1. Update news source set in Make (user requested source changes next).
2. Finalize rewritten-import scenario (Dropbox CSV -> Sanity notes in review).
3. Add cleanup automation scenario in Make:
   - archive stale `ingested` and `rejected` queue items
   - optional hard-delete old `archived` items
4. Aesthetic/UI polish for Studio is deferred and explicitly on TODO list.

## 8) Deferred TODO (Explicit)
- Improve Studio aesthetics/layout ergonomics at end of implementation phase.
- Keep function first, visual polish later.

## 9) Files Touched In This Session (Major)
- `studio/schemaTypes/sourceNewsItemType.ts`
- `studio/schemaTypes/noteType.ts`
- `studio/schemaTypes/index.ts`
- `studio/deskStructure.ts`
- `studio/components/NewsApprovalPane.tsx`
- `src/lib/queries.ts`
- `docs/CHAT_HANDOFF_CONTEXT_2026-03-05.md`

## 10) Notes / Constraints
- User preference: report issues before making unrelated code changes.
- Sanity pane mechanics are mostly fixed by Studio; structure is customizable via desk config.
- Local build checks for Studio passed after schema/desk changes.
