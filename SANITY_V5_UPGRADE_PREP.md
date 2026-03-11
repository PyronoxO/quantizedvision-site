# Sanity v5 Upgrade Status

Date: 2026-03-11

## Status

- Upgrade is completed and merged to `main`.
- Studio is running on Sanity v5 line in production workflow.

## What was validated

- Custom desk structure loads correctly:
  - Approval Board
  - News Importer
  - Bulk Publish
  - Bulk Operations
- Custom actions operate correctly:
  - `Fetch metadata`
  - `Refresh Cover`
- Custom inputs remain functional:
  - Sliders and color/font inputs
  - Regenerate cover input
- News pipeline core flow works:
  - import -> review -> bulk operations -> publish

## Notes

- The earlier v3.99 notice seen in browser was stale local Studio cache/session behavior.
- Running local Studio on current workspace now reflects the upgraded line.

## Post-upgrade guardrails

- Keep Studio dependency updates incremental (minor/patch first).
- Re-run this smoke test set after each Studio dependency bump:
  - `npm run studio:build`
  - `npm run studio:dev`
  - import one sample row in News Importer
  - run one Bulk Operation (metadata fetch)
  - publish one disposable draft note
