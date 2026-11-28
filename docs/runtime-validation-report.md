# Runtime Validation Report

**Generated**: 2026-11-28

## Summary

| Step | Status | Exit Code | Details |
|---|---:|---:|---|
| Unit tests | PASS | 0 | 4 files, 17 tests |
| Lint | PASS | 0 | Angular lint |
| Data validation | PASS | 0 | 24 place/timeline/itinerary tests |
| Build | PASS | 0 | 7 prerendered routes |
| Production server | PASS | 0 | 1 test |
| Playwright E2E | PASS | 0 | 17 tests |

**Overall**: PASS

## Environment

- Docker: UNAVAILABLE (CLI missing)
- Node.js: AVAILABLE (`v22.22.3`)
- Playwright/Chromium: AVAILABLE
- Browser tier: PRIMARY (Playwright)
- Infra tier: not applicable (static Angular application, no database or broker)

## Issues Found and Fixed

| # | Severity | Description | Resolution |
|---|---|---|---|
| 1 | Test defect | Story audio locator matched multiple action buttons | Locator now targets the `Ascolta` role/name |
| 2 | Accessibility/UI defect | Story cards rendered the saved-offline status twice | Removed the duplicate live-status block |

## Known Gaps

- Docker-dependent integration infrastructure is not applicable to the current static frontend architecture.
- No real field verification is provided for historical claims and coordinates marked `unverified`.
- Social Instagram assets are separate from the Angular application and require an editorial synchronization workflow.
