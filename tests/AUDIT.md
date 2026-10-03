# Papeles Resueltos browser audit

Baseline: `199fe6b8016829bc867b070c727738980a559075`.
Branch: `codex/e2e-audit-2026-10-03`.

Uses the actual [tester-army/e2e](https://github.com/tester-army/e2e) runner,
not a replacement test harness. Read upstream skill, setup, writing-tests and
running references at upstream revision `94ddbfe46faa5cf7b9159fd0a604aa4317056051`.
Pinned: `e2e@0.16.0`, `@e2e-dev/web@0.11.2`, `playwright@1.63.0`,
`axe-core@4.13.0`. The real OCR integration additionally pins
`tesseract.js@5.1.1`, `tesseract.js-core@5.1.1`, and official
`@tesseract.js-data/eng@1.0.0` / `@tesseract.js-data/spa@1.0.0`. No agent fixture, model, account, or API key is required.
Telemetry is explicitly disabled in npm scripts and CI.

## Reproduced baseline defects

The unchanged app failed all five tests in `regressions.e2e.ts` on a 390×844
Chromium viewport, run ID `01a10179-9489-71d6-8acd-31b8b38bcdb5`:

| Interaction | Observed baseline | Corrected behavior |
| --- | --- | --- |
| Open capture without selecting a photo | Read action and empty preview visible because grid CSS overrode `hidden` | Preview/read hidden until a valid image loads |
| Open demo field using Enter | Focus remained behind the modal | Focus moves into the dialog, cycles there, then returns to opener |
| Recognition rejects | Heading still says “Leyendo tu formulario…” | Finished error heading and retry/demo routes; worker released |
| OCR returns 20 unknown lines | Only the first 14 survived rendering | All unknown lines remain available in the scrollable text panel |
| Start tour, then close dialog | Timer remains active and sheet reopens | Closing, Escape, overlay, or stopping dismisses and clears the timer |

Five tests passed after fixes, run ID `01a1017c-c991-76fc-a1ed-81fa642c4c63`.
Axe also reproduced insufficient contrast on home subtitle and privacy note;
text colors now retain the paper/green/amber palette with sufficient contrast.
Accessibility audit disables CSS animations only while inspecting contrast,
so measurements represent settled screen colors instead of fade-in opacity.

Additional corrections: complete result explanations/advice, accessible live
statuses, image decode failures, worker creation/recognition cancellation and
cleanup, previous/next/stop tour controls, real browser history, responsive
long-text wrapping, and clearing photo/OCR text when leaving for home/demo.
Returning through history cannot display discarded photo results. The photo
source snippet in the hidden explanation sheet is cleared too; a dedicated
fixture repro caught this during verification.

## Coverage and boundaries

| Suite | Flows |
| --- | --- |
| `demo.e2e.ts` | Both home entry points, app back/home, every one of 18 demo cells and bilingual detail sheets, 18 accordion entries, full 18-step timed tour |
| `ocr.e2e.ts` | All 27 glossary entries and advice, camera/gallery input handling, picker button wiring, accented labels/hyphens/word boundaries, local storage privacy, empty/unknown/recognized/error results, missing CDN, worker load rejection, invalid/corrupt uploads, picker cancellation, cancel during loading/recognition, back/home cancellation, late responses, retry, photograph another, demo recovery |
| `regressions.e2e.ts` | Five baseline defect reproductions |
| `real-ocr.e2e.ts` | Browser upload of a regenerated synthetic bilingual PNG, authentic Tesseract worker/WASM and English/Spanish models, six recognized fields, source/detail explanation and photograph-another recovery |
| `accessibility.e2e.ts` | WCAG A/AA checks on home/demo/capture/results/modals, keyboard focus/escape/overlay/tour controls, 320/390/768px overflow checks |

Tests run on desktop (1280×900) and mobile viewport (390×844).
These are browser viewport tests; native iOS/Android camera permission dialogs
and hardware camera capture need device verification.

The 50 deterministic scenario checks intercept the external Tesseract script
with controlled worker fixtures. The UI, FileReader/image decoding, glossary matcher, result rendering,
navigation and lifecycle handling run as real application code. OCR recognition
accuracy, Tesseract WASM workers, and CDN language downloads are **not verified**
by those fixture tests. The separate real integration does exercise authentic
Tesseract/WASM and both language models on synthetic input, as described below. Google Fonts are blocked in tests to use local fallbacks.
The image fixture is synthetic, with no personal documents or credentials.

## Run

```sh
npm ci
npm run check
npx playwright install chromium --with-deps
npm run test:e2e
```

The runner starts and tears down the local static app through `e2e.config.ts`.
CI runs the same entire suite on pull requests and main pushes, retaining
reports, screenshots and traces on failure. Output is ignored under `.e2e/`.
An optional `E2E_CDP_ENDPOINT` connects the official web engine to an existing
Chromium browser. It is unset for normal local/CI runs.

In the audit workspace, Playwright's browser CDN returned invalid/truncated
archives. Browser execution used Chromium 153 obtained via npm and the official
CDP connect option, with browser startup and the runner in the same execution
network namespace. This changes browser provisioning only; the actual e2e
runner and all exact assertions remain the pinned installed packages.

## Final validation

The full suite passed **50/50** test-target pairs (25 cases on desktop and
mobile), 8/8 file-target pairs, with no failures, skips, flakes, or model calls.
Run: `01a1018d-a2ce-71d3-9cb4-50b7b16500b2`, exit 0, duration 323.27 seconds.
Command in the audit workspace:

```sh
node /workspace/scratch/3c82a66cb67c/tooling/run-e2e-cdp.mjs run --workers 1 --output .e2e/verified
```

The shared workspace wrapper launches npm-provisioned Chromium and calls the
installed e2e CLI; normal use remains `npm run test:e2e` after Playwright browser
installation. Reports: `.e2e/verified/report.json`, `junit.xml`, `summary.md`.
Success screenshots cover home, demo and fixture OCR results on both viewports.
`npm ci`, `npm run check`, and `git diff --check` also passed.
The scrollable unknown-text region is keyboard focusable; PageDown verification
passed on both viewports.

## Real OCR integration follow-up

`real-ocr.e2e.ts` uses a genuine browser upload of a high-contrast bilingual form
image regenerated with canvas, then the **unmodified official** Tesseract.js
5.1.1 API/worker/core/WASM and both `eng` and `spa` models. It redirects the
public CDN resource requests to authentic bytes installed from pinned upstream
npm packages and served by the test server. It does not replace recognition,
worker APIs, results, or the glossary. The product continues using its existing
public CDN architecture.

The test checks all six expected result fields (last name, first name, birth
date, SSN, signature, city), source values, bilingual explanation sheet and
reset. It also proves the real worker, WASM core and both model assets were
requested. No binary OCR/model assets are committed; `npm ci` regenerates them,
and the synthetic PNG and screenshots live under ignored `.e2e/` outputs.

An exploratory synthetic form included `I-485`, which real OCR transcribed as
`1-485`; the app honestly retained that line as unknown. The stable integration
fixture uses common fields. This verifies the real pipeline on synthetic input,
**not arbitrary form recognition accuracy, public CDN availability, or native
camera permissions/hardware**.

Run just the integration:

```sh
npm run test:e2e -- tests/real-ocr.e2e.ts
```

The configured complete suite now contains 52 test-target pairs: the existing
50 deterministic checks plus two real OCR integrations (desktop/mobile).

The final affected run passed **12/12** pairs (two real OCR integration cases
plus ten existing regression cases), exit 0, with no failures/flakes/skips.
Run ID: `01a1019c-496c-7b04-bedd-a625711a911b`, duration 26.70 seconds.
Evidence: `.e2e/ocr-integration-final/report.json`, `junit.xml`, `summary.md`,
and upload/result screenshots in `artifacts/` on both viewports.
`npm ci --ignore-scripts`, `npm run check`, and `git diff --check` passed.
All 52 cases are discovered by the normal test configuration and included in CI;
the previous complete 50-case run remains recorded above.
