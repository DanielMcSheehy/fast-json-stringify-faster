# Runtime matrix: Node 20 / 22 / 24 and Bun (JavaScriptCore)

All Node numbers come from `benchmark/docker/run.sh` (CPU-pinned Linux containers, base =
`origin/main`, alternating side order). Bun numbers were taken on the macOS host and are
directional only. Tests (`npm test`, 653 tests, 100% coverage) pass on Node 20, 22, 24; the
fast-path/array/toJSON subset (92 tests) passes under `bun test`.

## What the matrix caught

The first integrated build used a single 32-element cutoff for the primitive-array fast path
(copy into a null-prototype array, then native `JSON.stringify`). That cutoff was tuned on
one Node 24 probe that **discarded the output string**, which hides the cost of flattening the
baseline's cons-string. Measured with the output consumed (`Buffer.byteLength`, as any socket
write would) and across runtimes:

| Kind | Node 22/24 | Node 20 (V8 11.3) |
| --- | --- | --- |
| boolean | loses 25–44% at every size | loses 4–13% |
| integer (3-digit) | loses 30–43% below ~512, wins +50–100% above | loses 15–25% up to ~2e4, wins +23–48% from 1e5 |
| integer-valued `number` | wins from ~100 | loses 17–25% up to 2e4, ~0 at 1e5, +188% at 1e6 |
| float `number` | wins +80–130% from ~100 | wins +32–45% everywhere |

V8 12.4 (Node 22) added a native fast path for stringifying arrays of small integers; Node 20's
`JSON.stringify` falls behind the generated loop (whose per-item `ToString` hits V8's small-int
string cache) until the array is large enough that the baseline's string building dominates.
Int-valuedness of a `type: number` array is unknowable at build time, so Node 20 treats both
numeric kinds alike.

## Resulting cutoffs (`index.js`, `PRIMITIVE_FAST_PATH_MIN_LENGTH`)

| Runtime | integer | number | boolean | string (`largeArraySize`) |
| --- | ---: | ---: | --- | ---: |
| Node ≥ 22 | 512 | 32 | never | 2e4 (unchanged) |
| Node 20 | 1e5 | 1e5 | never | 2e4 (unchanged) |

Verification probe on Node 20 after the change (output consumed, harness distributions,
2 runs each): integer and number neutral (−1.8% … +2.8%) at 1e3 and 2e4; +29–48% at 1e5.

## Per-runtime headline results (final cutoffs; one container at a time, 3 rounds for
Node 20/22, 5 rounds for Node 24 — see `container-results.md`)

| Case | Node 24 | Node 22 | Node 20 |
| --- | ---: | ---: | ---: |
| build() tiny | +912% | +1288% | +1364% |
| build() deep | +102% | +73% | +93% |
| build() refs | +23% | +25% | +32% |
| 1e6 integer | +58% | +375% | +172% |
| 1e6 number | +168% | +268% | +81% |
| 1e6 short-string | +374% | +453% | +299% |
| 1e6 long-string | +66% | +95% | +139% |
| 1e3 integer | +30% | +27% | +1.5% (cutoff 1e5) |
| 1e3 number | +93% | +93% | +4% (cutoff 1e5) |
| bench.js short array of numbers / integers | +32% / +35% | +64% / +83% | ±0% |

Borderline rows (≤ −2%, CV < 4%) after the fix: Node 20 `integer / 2e4` −5.1% (classic loop
now sits in a larger generated function with the dormant fast-path branch); Node 22 scalar
`integer` −4.2% and `number` −2.7%, Node 20 `object with short string property` −4.5% — these
schemas generate byte-identical code on both sides, so they reflect process-layout/JIT variance
(the same rows are within ±1% in the 5-round Node 24 run).

Bun 1.4 (JavaScriptCore, host, noisy): 1e6 number +250%, short-string +64%, integer +44%;
build() tiny +861%, refs +42%. Direction matches V8; magnitudes are not comparable.

## Browsers

Not benchmarked. Chromium is V8 and adds no information beyond Node; Safari (JSC) is proxied by
Bun above; Firefox (SpiderMonkey) is untested. The library targets Node (`new Function`,
`process.versions.node`); `test/webpack.test.js` only checks bundling with `target: 'node'`.
