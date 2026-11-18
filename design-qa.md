# Vue 3 portal design QA

Final result: passed

## Scope and evidence

The selected service-home and application-dashboard references were compared beside the implementation in `.qa/vue-home-comparison.png` and `.qa/vue-certificates-comparison.png`. Desktop captures, narrow-screen captures and the four-step registration workflow were inspected. The reference images measure 1444 × 879 and 845 × 466; implementation captures measure 1429 × 1014 and 1404 × 1007. Comparison uses complete screenshots without stretching either source.

## Visual result

The home retains the reference hierarchy: introductory hero, guide action, four process cards, six achievement categories, online-registration card and service notices. The current brand color #144994 replaces the reference navy and gold as requested. Shared navigation connects the home, existing registration workflow and personal certificates. The dashboard retains five status summaries, filters, records and pagination in the same blue, white and pale-blue style as registration.

Intentional adaptations: the new navigation adds vertical height; reference demo identity and record counts are omitted; unavailable verification and authentication claims are omitted; certificate details open in a shared accessible dialog rather than a permanently visible side panel. This follows the user's request to use the second image as a loose reference while retaining the current style. The pending-integration screen is the real default; populated screenshots use intercepted test responses only.

An oversized dashboard action found during the first pass was fixed by disabling flex growth. Final desktop and mobile captures show no unintended horizontal page overflow. Required-field feedback reserves its own row. Confirmation dialogs preserve the background position. No unresolved blocking visual defects remain.

## Functional verification

- Format check passed for source, module docs, README, Vite configuration and HTML.
- Six hashing and API unit checks passed.
- Four static hosting and packaging checks passed.
- Vite 8 production build passed.
- Browser workflow check passed: file selection, both worker hashes, required fields, future-date rejection, read-only institute, personnel ordering, route-cached draft, confirmation, duplicate-submit prevention, SN copy and binary download.
- Browser failure scenarios passed: uncertain submission remains locked; issued certificate remains downloadable after database update failure.
- Isolated certificate-module check passed: status and keyword filters, reset, pagination, details, download, expired-login response, retry and mobile overflow. No real signing request was sent.

Evidence logs: `.qa/vue-browser-final.log`, `.qa/vue-records-final.log`. Browser assertions are maintained in `scripts/browser-check.mjs`.

## Integration limit

Authentication and personal-application endpoints have not been supplied. The production default makes no personal-list request and displays a pending-integration empty state. `src/api/certificates.js` and `docs/modules.md` document the proposed authenticated adapter contract; it remains disabled until a real backend is available. This is not an end-to-end verification against a live identity service.
