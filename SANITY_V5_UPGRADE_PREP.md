# Sanity v5 Upgrade Prep

Date: 2026-03-09

## Current Baseline

- Studio package: `sanity@3.99.0`
- Latest available: `5.13.0`
- React runtime already satisfies v5 requirement in lockfile:
  - `react@19.2.4`
  - `react-dom@19.2.4`
- Node runtime requirement warning from Sanity indicates Node 20+ path is expected for the next major line.

## Why this project is still on v3

- Initial CMS integration commit pinned `sanity` to v3 (`^3.86.0`) and the project evolved on top of that.
- No major-version migration has been run yet.

## Custom Work Inventory (must not break)

### Desk/Navigation
- `studio/deskStructure.ts`
  - Custom panes: Approval Board, News Importer, Bulk Publish, Bulk Operations

### Custom Panes
- `studio/components/NewsApprovalPane.tsx`
- `studio/components/NewsImportPane.tsx`
- `studio/components/BulkPublishPane.tsx`
- `studio/components/BulkOperationsPane.tsx`

### Custom Document Actions
- `studio/actions/fetchExternalMetadataAction.ts`
- `studio/actions/refreshNoteCoverAction.ts`

### Custom Inputs
- `studio/components/NumberSliderInput.tsx`
- `studio/components/HeroTimingSliderInput.tsx`
- `studio/components/FontSizeSliderInput.tsx`
- `studio/components/FontSelectInput.tsx`
- `studio/components/ColorPickerStringInput.tsx`
- `studio/components/RegenerateCoverImageInput.tsx`

### Schema Surface
- `studio/schemaTypes/*`

## Pre-Upgrade Hardening already applied

- Enabled strict React mode in CLI config:
  - `studio/sanity.cli.ts` -> `reactStrictMode: true`

## Risk Assessment

- Low risk:
  - schema definitions (`defineType`, `defineField`, `defineArrayMember`)
  - structure tool registration (`structureTool`)
  - `useClient` usage for patches/transactions/assets upload
- Medium risk:
  - custom input components using `PatchEvent` signatures
  - document action type signatures (`DocumentActionComponent`) if typing changed across major
  - any implicit behavior from list/document IDs during draft/published transitions

## Verification gates for upgrade (required)

1. `npm --prefix ./studio install sanity@^5`
2. `npm run studio:build`
3. `npm run studio:dev` and manual checks:
   - Approval Board loads
   - News Importer loads and imports one sample row
   - Bulk Operations:
     - multi-select
     - fetch metadata selected
     - set selected posts draft/published
     - delete selected post (on a disposable test entry)
   - Bulk Publish pane publishes review/draft batch
   - Artwork document action: `Fetch metadata`
   - Note document action: `Refresh Cover`
4. Frontend safety:
   - `npm run build`
   - home Featured Gallery renders external + local covers

## Rollback plan

- Keep migration on a dedicated branch.
- If any blocking break appears, reset only the upgrade commit(s) and keep current v3 production branch untouched.
