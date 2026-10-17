# Integrated speedup results

The integration merges the canonical harness and four production experiments into
`feature/speedup`, then corrects the primitive/string fast paths to preserve array
access and coercion semantics. The measured production commit is `6178790`; later
commits add this report only. Baseline is `origin/main` at `5f69709`.

## Decisions

The numbers in this table are the original experiment evidence, not the final
integrated comparison below. Each original report remains available for context.

| Experiment | Decision and key evidence |
| --- | --- |
| [bench-harness-profile](bench-harness-profile.md) | Merge canonical harness and profile summaries; identical-code controls varied −28.41% to +4.07% in the full suite, showing why repeated measurements matter. |
| [compile-overhead-build](compile-overhead-build.md) | Merge lazy Ajv construction and skip recursive-schema detection without `$ref`; tiny builds improved 15,370 → 87,272/s (+468%) in the experiment. |
| [object-array-codegen](object-array-codegen.md) | Merge folded brace/comma/key literals and direct closing-brace returns; required flat objects at 1e6 improved 3.01 → 3.78/s (+25.7%). |
| [primitive-array-fastpath](primitive-array-fastpath.md) | Merge with the semantic corrections below; original decimal arrays at 1e6 improved 20 → 58/s (+186.5%). |
| [string-array-fastpath](string-array-fastpath.md) | Merge with ordered miss handling below; original short strings at 1e6 improved 16 → 69/s (+331%). |
| [array-string-accumulation](array-string-accumulation.md) | Reject runtime changes; unroll ×4 regressed 11/36 large cases, including −18.3% at 2e4 numbers, and join had an output counterexample; retain report and regression tests. |
| [loop-micro-opts](loop-micro-opts.md) | Reject runtime changes; `if-i` lost 7.8% on 1e5 short strings and no variant met the gate; retain report and scratch notes. |
| [large-array-mechanism-heuristic](large-array-mechanism-heuristic.md) | Reject automatic opt-in/threshold changes despite ~1.6× native integer throughput at 2e4, because native skips coercion/filtering/order; retain report, README guidance, and four semantics tests. |
| [serializer-helpers](serializer-helpers.md) | Follow-up only; medium clean-string helper improved 24.4%, but the 8.2% array gain tracked unchanged integer noise; retain report, leave existing scalar helpers unchanged. |

## Integration details and correctness

The five merge commits are ordered harness → compile → object → primitive → string.
The four canonical harness/support files (`bench-large-array.js`, `bench-compile.js`,
`experiment-fixtures.js`, `experiment-utils.js`) are byte-identical to the harness
branch. Small report-referenced string-array and build profiling scripts are retained.
Rejected implementations, raw JSON/text measurements, data directories, and V8 trace
files are absent from the final tree; the harness's Markdown summaries remain.
Historical reports may refer to raw evidence available on their original branches.

The original primitive guard reread elements and called `JSON.stringify` on the source
array, invoking source `toJSON`; the original string miss reread the captured prefix.
Both needed correction to satisfy the integration contract:

- Native serialization uses a copy with a null prototype, ignoring source and inherited
  array `toJSON` and inherited index setters.
- Each source index is read once. At the first incompatible value, serialize the saved
  primitive prefix, coerce that saved value, then read/coerce subsequent elements in
  order. Getter changes, coercion mutations, and exceptions retain their old order.
- Capture length once and use the original loop for nonnumeric, fractional, or invalid
  array lengths supplied by proxies, avoiding extra length coercions.
- Primitive arrays shorter than 32 use the original loop: an integration probe at
  length 3 measured 23.81M/s baseline versus 8.00M/s with copying; at length 32,
  copying improved 3.44M/s to 4.00M/s. This internal cutoff avoids penalizing tiny
  nested arrays. Strings retain the existing `largeArraySize` threshold (default 2e4).
- Opt-in `largeArrayMechanism: 'json-stringify'` semantics remain unchanged, including
  its intentional differences from schema-aware serialization. No public API, option
  names, package version, or coverage thresholds changed.

Validation: `npm test` passes **652 unit tests**, **100% statements/branches/functions/
lines**, and **15 TypeScript assertions**; `npm run lint` passes separately (npm test
itself does not run lint). The 53 integration/primitive/rejected-branch semantic tests
also pass unchanged against origin/main. Tests include getters on hits and misses,
source/inherited `toJSON`, proxy length coercions, mutation/throw order, standalone
output, mixed values, holes, numeric edge cases, schema exclusions, and nested arrays.

## Measurement protocol

- Node **v24.19.0**, **darwin/arm64**, **Apple M5 Pro** (18 logical CPUs).
- Started **2026-10-17T02:31:40Z**; three complete runs per checkout for each of the three scripts, **18 canonical script invocations** total; one subsequent paired probe is described below.
- Serial execution with side order main→speedup, speedup→main, main→speedup for each
  suite; no concurrent test/profiling/benchmark jobs launched by this worker.
- Baseline is the requested `/tmp/fjs-main` worktree at origin/main. Because the repo
  sets `package-lock=false` and tracks no lockfile, a temporary lockfile was constructed
  from the integration checkout's installed dependency lock, then installed with
  `npm ci --package-lock=true --ignore-scripts --no-audit --no-fund`. Every dependency
  version was verified identical. Canonical harness/support files were copied to the
  baseline; production source was unchanged.
- Commands: `node benchmark/bench-large-array.js --json <temporary-file>`,
  `node benchmark/bench-compile.js --json <temporary-file>`, and
  `node benchmark/bench.js`, with default sampling settings and no `--expose-gc`.
- Large arrays: median of each run's median ops/sec (300ms, at least 8 measured
  iterations, 100ms/2-iteration warmup per isolated worker). Every output is checked
  before timing; `Buffer.byteLength` consumes every timed serialization.
- Compilation: median of reciprocal per-run median build latency, 100 builds after
  20 warmup builds per isolated schema worker. Schema allocation/module loading excluded.
- Full suite: median of its existing per-run mean throughput, all 30 cases unchanged.
  Its historically named “short array of long strings” still uses short strings.
- CV is sample standard deviation / mean across the three run statistics. It describes
  run variation, not a confidence interval or proof of absence of regressions.
- Raw final logs/JSON are local under `/tmp/fjs-final-bench`, excluded from Git.

## Large arrays: default mechanism

Ops/sec, higher is better. CV columns are origin/main / feature/speedup. All nine
canonical item kinds are shown at the requested sizes; typed arrays remain rejected.

| Kind / size | origin/main | feature/speedup | Change | CV main / speedup |
| --- | ---: | ---: | ---: | ---: |
| integer / 20,000 | 6,519.97 | 7,812.50 | +19.8% | 0.8% / 0.9% |
| number / 20,000 | 1,377.92 | 2,837.21 | +105.9% | 1.2% / 2.3% |
| short-string / 20,000 | 1,980.52 | 3,647.41 | +84.2% | 4.9% / 1.1% |
| long-string / 20,000 | 404.35 | 514.71 | +27.3% | 1.1% / 3.2% |
| flat-object / 20,000 | 861.39 | 905.97 | +5.2% | 2.0% / 2.0% |
| nested-object / 20,000 | 256.36 | 264.91 | +3.3% | 4.9% / 3.1% |
| nullable-number / 20,000 | 1,632.71 | 1,627.34 | -0.3% | 3.8% / 0.5% |
| Float64Array / 20,000 | TypeError | TypeError | unchanged | — |
| Int32Array / 20,000 | TypeError | TypeError | unchanged | — |
| integer / 100,000 | 1,161.33 | 1,520.00 | +30.9% | 0.9% / 1.4% |
| number / 100,000 | 261.57 | 559.28 | +113.8% | 1.6% / 2.6% |
| short-string / 100,000 | 377.14 | 645.73 | +71.2% | 1.7% / 1.5% |
| long-string / 100,000 | 71.05 | 100.10 | +40.9% | 10.9% / 0.9% |
| flat-object / 100,000 | 159.76 | 164.47 | +2.9% | 1.4% / 3.7% |
| nested-object / 100,000 | 21.55 | 20.63 | -4.3% | 1.8% / 4.9% |
| nullable-number / 100,000 | 306.12 | 305.73 | -0.1% | 2.4% / 1.3% |
| Float64Array / 100,000 | TypeError | TypeError | unchanged | — |
| Int32Array / 100,000 | TypeError | TypeError | unchanged | — |
| integer / 1,000,000 | 102.39 | 146.34 | +42.9% | 1.7% / 1.7% |
| number / 1,000,000 | 20.33 | 54.75 | +169.3% | 0.9% / 2.2% |
| short-string / 1,000,000 | 17.46 | 69.78 | +299.6% | 2.2% / 1.0% |
| long-string / 1,000,000 | 5.70 | 9.91 | +73.9% | 1.4% / 2.9% |
| flat-object / 1,000,000 | 4.79 | 4.98 | +3.9% | 3.8% / 1.6% |
| nested-object / 1,000,000 | 1.54 | 1.54 | +0.0% | 2.8% / 3.1% |
| nullable-number / 1,000,000 | 29.88 | 30.06 | +0.6% | 2.0% / 0.9% |
| Float64Array / 1,000,000 | TypeError | TypeError | unchanged | — |
| Int32Array / 1,000,000 | TypeError | TypeError | unchanged | — |

## Compilation

Builds/sec and median milliseconds per build. Millisecond values are medians of the
three per-run median latencies (and therefore the reciprocal of the median throughput).

| Schema | origin/main builds/s | speedup builds/s | Change | main ms | speedup ms | CV main / speedup |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| tiny | 22,140.06 | 214,270.41 | +867.8% | 0.0452 | 0.0047 | 3.3% / 0.9% |
| wide | 4,528.30 | 8,037.49 | +77.5% | 0.2208 | 0.1244 | 2.3% / 1.8% |
| deep | 10,204.08 | 21,324.01 | +109.0% | 0.0980 | 0.0469 | 1.4% / 1.4% |
| refs | 2,950.03 | 2,880.46 | -2.4% | 0.3390 | 0.3472 | 1.3% / 2.6% |
| array-of-objects | 18,905.20 | 75,120.19 | +297.4% | 0.0529 | 0.0133 | 1.5% / 6.0% |
| oneOf-anyOf | 9,795.95 | 9,813.98 | +0.2% | 0.1021 | 0.1019 | 3.4% / 4.5% |
| standalone | 4,622.94 | 7,812.50 | +69.0% | 0.2163 | 0.1280 | 1.6% / 0.9% |

## Full benchmark/bench.js

Ops/sec, all 30 existing cases.

| Case | origin/main | feature/speedup | Change | CV main / speedup |
| --- | ---: | ---: | ---: | ---: |
| short string | 23,060,951.00 | 23,030,929.00 | -0.1% | 0.3% / 0.4% |
| unsafe short string | 23,669,695.00 | 23,665,793.00 | -0.0% | 0.1% / 0.1% |
| short string with double quote | 18,088,944.00 | 18,090,455.00 | +0.0% | 1.2% / 0.5% |
| long string without double quotes | 65,258.00 | 64,908.00 | -0.5% | 2.1% / 1.3% |
| unsafe long string without double quotes | 224,444.00 | 224,326.00 | -0.1% | 0.4% / 0.1% |
| long string | 55,400.00 | 55,436.00 | +0.1% | 2.6% / 0.2% |
| unsafe long string | 222,876.00 | 223,970.00 | +0.5% | 0.5% / 0.2% |
| number | 34,318,034.00 | 34,776,419.00 | +1.3% | 2.3% / 8.7% |
| integer | 35,126,638.00 | 35,049,072.00 | -0.2% | 0.3% / 0.3% |
| formatted date-time | 2,971,737.00 | 2,972,334.00 | +0.0% | 0.4% / 1.0% |
| formatted date | 2,686,136.00 | 2,686,496.00 | +0.0% | 0.2% / 0.7% |
| formatted time | 2,692,096.00 | 2,694,374.00 | +0.1% | 0.3% / 0.7% |
| short array of numbers | 106,961.00 | 146,146.00 | +36.6% | 1.0% / 3.7% |
| short array of integers | 104,578.00 | 149,011.00 | +42.5% | 2.3% / 1.2% |
| short array of short strings | 39,089.00 | 38,355.00 | -1.9% | 3.3% / 4.6% |
| short array of long strings | 39,539.00 | 38,100.00 | -3.6% | 2.5% / 4.4% |
| short array of objects with properties of different types | 18,102.00 | 19,273.00 | +6.5% | 2.1% / 5.2% |
| object with number property | 24,228,609.00 | 24,232,233.00 | +0.0% | 5.2% / 0.5% |
| object with integer property | 24,606,956.00 | 28,078,137.00 | +14.1% | 3.9% / 1.9% |
| object with short string property | 21,090,345.00 | 21,178,738.00 | +0.4% | 1.6% / 0.8% |
| object with long string property | 53,083.00 | 52,552.00 | -1.0% | 0.5% / 0.8% |
| object with properties of different types | 3,696,861.00 | 3,736,229.00 | +1.1% | 1.4% / 2.0% |
| simple object | 11,825,750.00 | 12,153,915.00 | +2.8% | 7.3% / 1.1% |
| simple object with required fields | 11,462,597.00 | 12,402,162.00 | +8.2% | 0.7% / 1.8% |
| oneOf external refs compile and first stringify | 1,987.00 | 1,986.00 | -0.1% | 0.6% / 5.3% |
| object with const string property | 23,847,695.00 | 34,473,415.00 | +44.6% | 0.1% / 1.8% |
| object with const number property | 34,243,365.00 | 34,547,914.00 | +0.9% | 1.3% / 1.5% |
| object with const bool property | 28,294,786.00 | 34,217,871.00 | +20.9% | 5.3% / 4.1% |
| object with const object property | 23,798,299.00 | 33,953,454.00 | +42.7% | 0.3% / 2.2% |
| object with const null property | 27,684,056.00 | 34,691,892.00 | +25.3% | 2.2% / 5.7% |

## Interpretation and follow-ups

At one million elements, final default throughput improves **42.9% for integers,
169.3% for decimals, 299.6% for short strings, and 73.9% for long strings**. Flat
objects improve **3.9%** and nested objects are effectively flat (**+0.0%**): the
original object experiment's >5% win does not reproduce on these particular
million-element canonical fixtures. Tiny compilation improves **867.8%**, wide
**77.5%**, and deep **109.0%**; reference-heavy compilation is **2.4% slower** and
union compilation is flat (**+0.2%**). Nested objects at 100,000 elements are
**4.3% slower** (CV 1.8% / 4.9%) and warrant a separate recheck. These are
workload-specific gains, not a universal speedup.

The full suite has **1 of 30** median comparisons below −2%.

- `short array of long strings`: -3.6%, CV 2.5% / 4.4%.

A subsequent same-process probe of that exact fixture (1,000 copies of `hello world`,
plain string item schema, `Buffer.byteLength` per call) ran five alternating pairs
with tinybench 6.2.1, 1,000ms measurement and 250ms warmup per side. Median mean
throughput was **38,675.62 → 38,321.43 ops/sec (-0.9%)**, with
between-run CV **1.4% / 0.6%**. This narrower comparison is within the 2% gate;
it does not replace the full-suite table. Raw paired values remain in
`/tmp/fjs-final-bench/short-strings-paired.json`.

Assess these rows with their variation and whether the schema's generated code changed;
small noisy deltas do not prove a regression, and repeated medians alone do not prove
that the strict no-regression performance gate has been met. Byte-equivalence and the
100% coverage gate are separate, passing checks.

Follow-ups: measure mixed/coercing string-array workloads now that misses resume from
saved values; tune copying thresholds on representative payloads and supported Node
versions; retain scalar helper experiments as separate work; profile remaining union/
Ajv and reference-heavy compilation costs. Rejected general native auto-selection
remains unsafe without runtime semantic guards. Large-array GC variation and this
single-host sample limit the precision of small percentage changes.

## Native and opt-in controls

These mechanisms are unchanged. Their variation helps interpret machine/GC noise;
these are not alternative semantics for arbitrary schema inputs.

| Kind / size / mechanism | origin/main | feature/speedup | Change | CV main / speedup |
| --- | ---: | ---: | ---: | ---: |
| integer / 20,000 / json-stringify | 12,152.00 | 12,441.68 | +2.4% | 3.5% / 1.5% |
| integer / 20,000 / native | 12,454.70 | 12,545.63 | +0.7% | 3.6% / 0.7% |
| number / 20,000 / json-stringify | 3,144.65 | 3,125.41 | -0.6% | 1.8% / 1.5% |
| number / 20,000 / native | 3,119.32 | 3,102.98 | -0.5% | 1.4% / 1.6% |
| short-string / 20,000 / json-stringify | 4,304.93 | 4,268.94 | -0.8% | 2.3% / 0.6% |
| short-string / 20,000 / native | 4,224.98 | 4,267.41 | +1.0% | 1.6% / 1.2% |
| long-string / 20,000 / json-stringify | 520.23 | 522.06 | +0.4% | 4.2% / 3.2% |
| long-string / 20,000 / native | 528.98 | 529.20 | +0.0% | 3.0% / 4.5% |
| flat-object / 20,000 / json-stringify | 942.06 | 932.53 | -1.0% | 0.8% / 1.2% |
| flat-object / 20,000 / native | 933.71 | 934.69 | +0.1% | 1.1% / 1.3% |
| nested-object / 20,000 / json-stringify | 302.67 | 300.68 | -0.7% | 0.9% / 3.4% |
| nested-object / 20,000 / native | 300.31 | 299.92 | -0.1% | 0.8% / 2.8% |
| nullable-number / 20,000 / json-stringify | 2,391.75 | 2,414.00 | +0.9% | 4.3% / 3.1% |
| nullable-number / 20,000 / native | 2,453.11 | 2,408.43 | -1.8% | 3.8% / 2.5% |
| Float64Array / 20,000 / native | 963.01 | 968.37 | +0.6% | 1.6% / 2.2% |
| Int32Array / 20,000 / native | 1,593.63 | 1,558.54 | -2.2% | 0.9% / 1.1% |
| integer / 100,000 / json-stringify | 2,422.29 | 2,395.69 | -1.1% | 0.7% / 0.8% |
| integer / 100,000 / native | 2,396.16 | 2,394.97 | -0.0% | 0.3% / 3.1% |
| number / 100,000 / json-stringify | 620.24 | 610.31 | -1.6% | 2.6% / 0.9% |
| number / 100,000 / native | 614.95 | 607.84 | -1.2% | 1.0% / 1.0% |
| short-string / 100,000 / json-stringify | 851.73 | 837.49 | -1.7% | 1.4% / 1.1% |
| short-string / 100,000 / native | 849.51 | 838.22 | -1.3% | 2.7% / 2.4% |
| long-string / 100,000 / json-stringify | 106.06 | 103.85 | -2.1% | 3.2% / 1.7% |
| long-string / 100,000 / native | 106.79 | 103.90 | -2.7% | 4.2% / 0.9% |
| flat-object / 100,000 / json-stringify | 190.36 | 188.29 | -1.1% | 1.9% / 1.7% |
| flat-object / 100,000 / native | 190.76 | 185.39 | -2.8% | 1.7% / 1.9% |
| nested-object / 100,000 / json-stringify | 59.02 | 57.76 | -2.1% | 1.4% / 2.1% |
| nested-object / 100,000 / native | 58.54 | 57.71 | -1.4% | 1.3% / 1.5% |
| nullable-number / 100,000 / json-stringify | 458.70 | 453.48 | -1.1% | 2.3% / 4.0% |
| nullable-number / 100,000 / native | 462.43 | 450.53 | -2.6% | 4.6% / 0.9% |
| Float64Array / 100,000 / native | 177.90 | 179.61 | +1.0% | 1.6% / 0.8% |
| Int32Array / 100,000 / native | 283.37 | 274.57 | -3.1% | 1.2% / 0.6% |
| integer / 1,000,000 / json-stringify | 239.79 | 236.45 | -1.4% | 1.1% / 0.9% |
| integer / 1,000,000 / native | 233.45 | 236.02 | +1.1% | 0.5% / 0.4% |
| number / 1,000,000 / json-stringify | 60.15 | 60.74 | +1.0% | 1.3% / 1.0% |
| number / 1,000,000 / native | 60.14 | 60.59 | +0.8% | 2.1% / 0.9% |
| short-string / 1,000,000 / json-stringify | 84.38 | 83.60 | -0.9% | 3.0% / 0.5% |
| short-string / 1,000,000 / native | 83.77 | 83.14 | -0.7% | 3.3% / 0.8% |
| long-string / 1,000,000 / json-stringify | 10.36 | 10.15 | -2.0% | 1.8% / 1.8% |
| long-string / 1,000,000 / native | 10.26 | 10.08 | -1.8% | 2.3% / 1.3% |
| flat-object / 1,000,000 / json-stringify | 18.15 | 18.02 | -0.7% | 0.4% / 0.7% |
| flat-object / 1,000,000 / native | 17.86 | 17.72 | -0.8% | 1.3% / 2.1% |
| nested-object / 1,000,000 / json-stringify | 5.87 | 5.81 | -1.2% | 0.7% / 2.4% |
| nested-object / 1,000,000 / native | 5.80 | 5.86 | +1.0% | 1.5% / 1.7% |
| nullable-number / 1,000,000 / json-stringify | 41.24 | 41.70 | +1.1% | 2.3% / 0.6% |
| nullable-number / 1,000,000 / native | 41.17 | 41.86 | +1.7% | 1.7% / 0.2% |
| Float64Array / 1,000,000 / native | 13.61 | 13.69 | +0.6% | 0.4% / 0.6% |
| Int32Array / 1,000,000 / native | 27.55 | 27.41 | -0.5% | 6.1% / 0.9% |
