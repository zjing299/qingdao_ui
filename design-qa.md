# Design QA

final result: passed

## Visual target and evidence

- Source: `C:/Users/LENOVO/AppData/Local/Temp/codex-clipboard-3b4d8523-4efc-43bb-92da-ce0e7f7a2896.png` (1419 × 992).
- Color override: `C:/Users/LENOVO/AppData/Local/Temp/codex-clipboard-edf4d80e-e78d-46f3-8702-fbfdbe251365.png`; sampled RGB 20,73,148, CSS #144994.
- Implementation: `.qa/desktop-filled.png`, `.qa/mobile-success.png`, `.qa/desktop-confirm.png`, `.qa/desktop-success.png`.
- Combined full-view comparison: `.qa/comparison-final.png`. Focused form comparison: `.qa/comparison-detail.png`. Both were opened and visually inspected together with the source.
- Desktop CSS viewport 1419 × 992, deviceScaleFactor 1. Full-page screenshot 1404 × 1036; 15px reserved for desktop scrollbar. Full page grows with real form controls; screenshots are compared at native density without stretching. Mobile viewport 390 × 844, density 1, full-page capture.
- Final full-page pixels: source 1419 × 992; implementation 1404 × 1036 (15px desktop scrollbar excluded by browser capture, longer content from real controls); CSS viewport 1419 × 992, deviceScaleFactor 1. Evidence: `.qa/comparison-final.png` and `.qa/comparison-detail.png`; screenshots `.qa/desktop-filled.png`, `.qa/mobile-success.png`, `.qa/desktop-confirm.png`, `.qa/desktop-success.png`.
- State: file selected, both hashes ready, registration filled, second step active. Reference has three inline names; test fixture has two editable names and real reorder controls. Fixture contains the three-byte file abc rather than the reference's 18.4MB document; size and hashes therefore intentionally differ.

## Findings and iteration history

1. First pass: desktop content was too tall and page gutter was missing; researcher controls added excessive vertical density. Reduced upload/submission padding, restored outer gutter, and placed short personnel controls inline on desktop.
2. Second pass: the general input width rule overrode personnel input width, causing overlapping controls. Corrected selector specificity and recaptured both viewports.
3. Final combined inspection: researcher inputs and controls no longer overlap, panels align, required input labels remain legible, and desktop/mobile contain no horizontal overflow. No remaining actionable P0/P1/P2 issues.

## Required fidelity surfaces

- Typography: Chinese system sans-serif stack, 17px header, 16px section titles, 11–13px dense form/supporting text, matching the reference's compact administrative form hierarchy. Native select/date controls are retained for usability.
- Layout: four equal-width steps; desktop left form and right 349px summary column; pale bordered white panels, 12px radii, 16–24px section gaps. Small height differences accommodate real editable fields and consent checkbox. Mobile stacks panels and keeps controls accessible.
- Colors: primary #144994 follows the user's explicit color override, with pale blue-gray fields, white panels, green local-privacy note, cream certificate panel and yellow security heading.
- Assets: the supplied screen has no photos, logos or illustrative assets to recreate; all content consists of native form/UI text and panels. No generated imagery or substitute artwork needed.
- Copy: reference structure retained. User identity, automatic identity-provider defaults, logout and external verifier claims are omitted because the backend does not implement those features. The research-unit default is editable. File type/size, errors and status reflect actual application state.

## Functional verification

`node scripts/browser-check.mjs` passed using an isolated Chrome headless profile because an in-app browser automation tool was unavailable. No Playwright CLI/MCP was used.

- Worker computes both known abc digests; unit tests additionally cover empty and cross-chunk files.
- Add/reorder personnel and numeric confidentiality preserve JSON shape.
- Confirmation dialog, both algorithm routes, and duplicate-click prevention work.
- Returned Base64 AQID downloads as binary bytes 01 02 03 with .tsr extension.
- Ambiguous signing failure locks repeat submission; code 3002 preserves issued credential download.
- No browser runtime/console errors recorded; mobile horizontal overflow check passed.
- Browser signing requests were intercepted with test responses; no paid/real upstream issuance or database writes were performed by these tests.
- Unit tests, production build and starter static-host packaging tests passed.
- Live backend connectivity verified through the frontend proxy: an intentionally invalid digest returned HTTP 400 / code 1003 from the existing backend at 192.168.188.32:3010; validation occurs before database creation/signing, so this probe did not issue a timestamp.

## Follow-up polish / limits

- No login/history functionality because those APIs are not available.
- Real production signing still depends on running backend and valid upstream configuration.
- 2GB maximum is enforced; the largest automated input tested is just over 5MB, not a full 2GB browser stress test.
- Save credentials before refreshing; sensitive form/file information is not persisted in browser storage.

final result: passed
