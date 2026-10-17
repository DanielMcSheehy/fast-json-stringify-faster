# Benchmark harness and CPU profile experiment

## Hypothesis

A deterministic array/build harness, including output consumption and profiles of
the measured phase, can identify specific optimization targets without changing
serialization semantics. This is an instrumentation experiment, not an index.js or
lib/ optimization. The before/after comparison is a control for measurement variability:
both checkouts use identical library source.

## Changes

- Added [`bench-large-array.js`](../benchmark/bench-large-array.js): tinybench measurements
  for four sizes, nine input kinds, and three mechanisms, with Markdown and optional JSON
  output, isolated workers, output checks and explicit typed-array rejection rows.
- Added [`bench-compile.js`](../benchmark/bench-compile.js): median build wall time over
  configurable N (default 100), seven schemas including standalone, and separate warmup.
- Added shared deterministic fixtures and worker/result utilities in
  [`experiment-fixtures.js`](../benchmark/experiment-fixtures.js) and
  [`experiment-utils.js`](../benchmark/experiment-utils.js).
- Added [`profile-workload.js`](../benchmark/profile-workload.js) and
  [`profile-summary.js`](../benchmark/profile-summary.js) to capture and summarize the
  measured phase of a Node CPU profile, including GC samples within that phase.
- Added [baseline tables](baseline.md), [profiles and ranked hypotheses](profile.md),
  and the raw measurement evidence under `EXPERIMENTS/results/bench-harness-profile/`.

No production source, package metadata, public options or existing benchmark fixtures
were changed. The base commit is `d335e9c21ddc12f5f365991b55d65df3d0825098` on
`feature/speedup`; the experiment branch is `exp/bench-harness-profile`.

## Protocol and interpretation

See [baseline.md](baseline.md) for the machine, fixture shapes, sampling rules and
reproduction commands. Both new harnesses and the entire existing suite were run
three times on each checkout, on Node v24.19.0, in alternating before/after order.
Array ops/sec below are medians of per-run median throughput; compilation ops/sec
are medians of reciprocal per-run median build latency. Full-suite ops/sec are medians
of its existing per-run throughput means. CV reports between-run sample dispersion.

Because library code is identical and the machine is shared, apparent gains or
regressions are not attributed to this branch. The contract's >5% targeted gain and
no >2% regression criterion must be applied to a future production-code experiment;
this branch supplies the harness and measurement baseline for that decision.

<!-- generated tables -->

## Targeted before/after array throughput

All values are ops/sec. CV columns describe the three per-run median throughputs.

| Kind | Size | Mechanism | Before | After | Δ % | Before CV % | After CV % |
| --- | ---: | --- | ---: | ---: | ---: | ---: | ---: |
| integer | 1000 | default | 98,357.43 | 105,730.60 | +7.50 | 8.05 | 11.00 |
| integer | 1000 | json-stringify | 100,000.00 | 107,135.20 | +7.14 | 14.93 | 6.07 |
| integer | 1000 | native | 169,004.56 | 196,695.52 | +16.38 | 8.23 | 10.68 |
| number | 1000 | default | 19,138.76 | 25,000.00 | +30.63 | 7.91 | 4.16 |
| number | 1000 | json-stringify | 19,753.09 | 25,183.84 | +27.49 | 11.40 | 1.57 |
| number | 1000 | native | 41,096.45 | 55,812.92 | +35.81 | 15.08 | 13.69 |
| short-string | 1000 | default | 36,309.50 | 38,035.83 | +4.75 | 7.18 | 5.83 |
| short-string | 1000 | json-stringify | 37,037.04 | 37,914.69 | +2.37 | 10.12 | 6.56 |
| short-string | 1000 | native | 66,480.52 | 77,172.40 | +16.08 | 15.19 | 13.83 |
| long-string | 1000 | default | 5,956.81 | 6,920.42 | +16.18 | 13.58 | 15.75 |
| long-string | 1000 | json-stringify | 5,893.19 | 7,004.25 | +18.85 | 10.55 | 14.35 |
| long-string | 1000 | native | 6,928.42 | 9,118.60 | +31.61 | 34.37 | 14.32 |
| flat-object | 1000 | default | 15,727.47 | 16,551.91 | +5.24 | 5.36 | 5.05 |
| flat-object | 1000 | json-stringify | 16,326.53 | 16,304.44 | -0.14 | 6.79 | 8.60 |
| flat-object | 1000 | native | 15,018.85 | 15,604.52 | +3.90 | 12.35 | 8.55 |
| nested-object | 1000 | default | 4,611.84 | 4,837.72 | +4.90 | 11.55 | 8.93 |
| nested-object | 1000 | json-stringify | 4,745.90 | 4,456.00 | -6.11 | 4.79 | 13.78 |
| nested-object | 1000 | native | 4,924.07 | 4,830.92 | -1.89 | 6.09 | 14.62 |
| nullable-number | 1000 | default | 24,792.98 | 24,439.72 | -1.42 | 5.47 | 17.11 |
| nullable-number | 1000 | json-stringify | 24,767.80 | 24,896.68 | +0.52 | 5.99 | 14.81 |
| nullable-number | 1000 | native | 40,404.04 | 49,485.35 | +22.48 | 4.10 | 16.62 |
| Float64Array | 1000 | default | TypeError | TypeError | — | — | — |
| Float64Array | 1000 | json-stringify | TypeError | TypeError | — | — | — |
| Float64Array | 1000 | native | 15,594.54 | 19,851.12 | +27.30 | 12.94 | 16.87 |
| Int32Array | 1000 | default | TypeError | TypeError | — | — | — |
| Int32Array | 1000 | json-stringify | TypeError | TypeError | — | — | — |
| Int32Array | 1000 | native | 26,845.64 | 30,131.84 | +12.24 | 14.23 | 13.69 |
| integer | 20000 | default | 4,823.64 | 5,135.88 | +6.47 | 15.75 | 10.18 |
| integer | 20000 | json-stringify | 8,516.65 | 8,327.57 | -2.22 | 14.24 | 18.58 |
| integer | 20000 | native | 8,823.52 | 8,374.02 | -5.09 | 14.35 | 17.75 |
| number | 20000 | default | 881.70 | 930.34 | +5.52 | 9.99 | 10.04 |
| number | 20000 | json-stringify | 2,022.16 | 1,961.59 | -3.00 | 15.57 | 22.68 |
| number | 20000 | native | 2,250.14 | 2,107.67 | -6.33 | 13.40 | 22.74 |
| short-string | 20000 | default | 1,564.49 | 1,507.16 | -3.66 | 8.33 | 13.03 |
| short-string | 20000 | json-stringify | 3,013.56 | 2,830.52 | -6.07 | 4.94 | 18.31 |
| short-string | 20000 | native | 2,885.66 | 2,831.52 | -1.88 | 4.94 | 18.06 |
| long-string | 20000 | default | 269.84 | 274.64 | +1.78 | 11.73 | 11.89 |
| long-string | 20000 | json-stringify | 382.95 | 368.93 | -3.66 | 11.45 | 14.07 |
| long-string | 20000 | native | 344.95 | 386.20 | +11.96 | 52.82 | 14.54 |
| flat-object | 20000 | default | 604.90 | 654.02 | +8.12 | 10.06 | 14.34 |
| flat-object | 20000 | json-stringify | 634.42 | 714.46 | +12.62 | 11.89 | 16.83 |
| flat-object | 20000 | native | 616.11 | 722.52 | +17.27 | 35.85 | 13.22 |
| nested-object | 20000 | default | 143.39 | 166.72 | +16.27 | 53.96 | 15.49 |
| nested-object | 20000 | json-stringify | 195.29 | 203.49 | +4.20 | 33.32 | 19.07 |
| nested-object | 20000 | native | 185.88 | 207.86 | +11.83 | 21.22 | 17.78 |
| nullable-number | 20000 | default | 1,078.36 | 1,228.00 | +13.88 | 13.60 | 13.51 |
| nullable-number | 20000 | json-stringify | 1,641.08 | 1,980.85 | +20.70 | 16.98 | 13.20 |
| nullable-number | 20000 | native | 1,704.67 | 2,124.64 | +24.64 | 13.65 | 12.81 |
| Float64Array | 20000 | default | TypeError | TypeError | — | — | — |
| Float64Array | 20000 | json-stringify | TypeError | TypeError | — | — | — |
| Float64Array | 20000 | native | 649.67 | 805.40 | +23.97 | 17.85 | 13.66 |
| Int32Array | 20000 | default | TypeError | TypeError | — | — | — |
| Int32Array | 20000 | json-stringify | TypeError | TypeError | — | — | — |
| Int32Array | 20000 | native | 1,028.89 | 1,356.32 | +31.82 | 15.84 | 15.46 |
| integer | 100000 | default | 774.41 | 837.43 | +8.14 | 19.88 | 20.48 |
| integer | 100000 | json-stringify | 1,663.95 | 1,738.88 | +4.50 | 15.55 | 15.29 |
| integer | 100000 | native | 1,602.08 | 1,702.19 | +6.25 | 16.33 | 14.84 |
| number | 100000 | default | 133.82 | 201.06 | +50.25 | 37.67 | 17.46 |
| number | 100000 | json-stringify | 397.75 | 439.41 | +10.47 | 8.96 | 20.60 |
| number | 100000 | native | 393.65 | 465.87 | +18.35 | 16.91 | 16.29 |
| short-string | 100000 | default | 258.54 | 321.94 | +24.52 | 15.95 | 14.80 |
| short-string | 100000 | json-stringify | 549.02 | 637.64 | +16.14 | 8.80 | 15.92 |
| short-string | 100000 | native | 579.19 | 665.11 | +14.83 | 15.38 | 14.66 |
| long-string | 100000 | default | 37.89 | 58.59 | +54.61 | 64.31 | 51.65 |
| long-string | 100000 | json-stringify | 63.98 | 81.79 | +27.83 | 28.42 | 57.51 |
| long-string | 100000 | native | 68.20 | 77.16 | +13.13 | 53.92 | 47.29 |
| flat-object | 100000 | default | 104.68 | 117.10 | +11.87 | 69.74 | 46.37 |
| flat-object | 100000 | json-stringify | 125.74 | 131.45 | +4.54 | 48.33 | 49.77 |
| flat-object | 100000 | native | 127.73 | 140.17 | +9.74 | 18.01 | 18.85 |
| nested-object | 100000 | default | 15.68 | 16.28 | +3.84 | 59.87 | 15.33 |
| nested-object | 100000 | json-stringify | 43.88 | 44.65 | +1.74 | 67.81 | 38.29 |
| nested-object | 100000 | native | 44.58 | 46.60 | +4.53 | 56.56 | 37.67 |
| nullable-number | 100000 | default | 215.38 | 243.87 | +13.23 | 6.48 | 49.15 |
| nullable-number | 100000 | json-stringify | 304.85 | 381.89 | +25.27 | 34.22 | 17.53 |
| nullable-number | 100000 | native | 323.10 | 315.53 | -2.34 | 3.20 | 10.68 |
| Float64Array | 100000 | default | TypeError | TypeError | — | — | — |
| Float64Array | 100000 | json-stringify | TypeError | TypeError | — | — | — |
| Float64Array | 100000 | native | 134.92 | 126.01 | -6.61 | 9.65 | 10.63 |
| Int32Array | 100000 | default | TypeError | TypeError | — | — | — |
| Int32Array | 100000 | json-stringify | TypeError | TypeError | — | — | — |
| Int32Array | 100000 | native | 216.96 | 181.31 | -16.43 | 9.65 | 14.80 |
| integer | 1000000 | default | 84.57 | 69.11 | -18.28 | 11.55 | 11.69 |
| integer | 1000000 | json-stringify | 172.48 | 158.17 | -8.30 | 10.45 | 11.97 |
| integer | 1000000 | native | 170.14 | 152.83 | -10.18 | 10.67 | 4.61 |
| number | 1000000 | default | 15.97 | 15.05 | -5.78 | 10.48 | 21.34 |
| number | 1000000 | json-stringify | 46.61 | 38.50 | -17.40 | 13.81 | 12.30 |
| number | 1000000 | native | 44.01 | 34.68 | -21.21 | 16.24 | 18.98 |
| short-string | 1000000 | default | 14.26 | 11.97 | -16.05 | 8.27 | 18.96 |
| short-string | 1000000 | json-stringify | 64.08 | 57.46 | -10.34 | 13.89 | 6.66 |
| short-string | 1000000 | native | 64.79 | 54.42 | -16.00 | 10.18 | 14.34 |
| long-string | 1000000 | default | 4.40 | 4.12 | -6.30 | 11.67 | 12.39 |
| long-string | 1000000 | json-stringify | 7.09 | 7.97 | +12.36 | 33.63 | 10.15 |
| long-string | 1000000 | native | 7.85 | 8.22 | +4.75 | 39.13 | 14.76 |
| flat-object | 1000000 | default | 3.87 | 4.19 | +8.29 | 29.70 | 12.88 |
| flat-object | 1000000 | json-stringify | 14.72 | 12.53 | -14.88 | 27.85 | 23.86 |
| flat-object | 1000000 | native | 14.32 | 14.63 | +2.18 | 22.44 | 8.86 |
| nested-object | 1000000 | default | 0.99 | 0.91 | -8.56 | 22.34 | 16.03 |
| nested-object | 1000000 | json-stringify | 4.17 | 4.07 | -2.37 | 50.75 | 18.54 |
| nested-object | 1000000 | native | 4.67 | 2.36 | -49.44 | 53.56 | 61.91 |
| nullable-number | 1000000 | default | 16.75 | 12.28 | -26.72 | 60.69 | 65.16 |
| nullable-number | 1000000 | json-stringify | 27.98 | 20.22 | -27.72 | 44.12 | 54.72 |
| nullable-number | 1000000 | native | 23.72 | 26.46 | +11.57 | 26.81 | 54.05 |
| Float64Array | 1000000 | default | TypeError | TypeError | — | — | — |
| Float64Array | 1000000 | json-stringify | TypeError | TypeError | — | — | — |
| Float64Array | 1000000 | native | 9.12 | 9.07 | -0.58 | 31.61 | 33.15 |
| Int32Array | 1000000 | default | TypeError | TypeError | — | — | — |
| Int32Array | 1000000 | json-stringify | TypeError | TypeError | — | — | — |
| Int32Array | 1000000 | native | 14.41 | 14.88 | +3.24 | 50.96 | 44.20 |

## Targeted before/after build throughput and latency

| Schema | Before builds/sec | After builds/sec | Δ % | Before ms | After ms | Before CV % | After CV % |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| tiny | 15,473.89 | 14,371.22 | -7.13 | 0.0646 | 0.0696 | 9.88 | 24.34 |
| wide | 2,846.47 | 2,373.65 | -16.61 | 0.3513 | 0.4213 | 13.17 | 20.68 |
| deep | 6,656.50 | 6,754.86 | +1.48 | 0.1502 | 0.1480 | 11.57 | 15.02 |
| refs | 1,699.30 | 1,797.95 | +5.81 | 0.5885 | 0.5562 | 17.12 | 11.46 |
| array-of-objects | 12,545.71 | 11,875.36 | -5.34 | 0.0797 | 0.0842 | 23.39 | 20.53 |
| oneOf-anyOf | 5,637.12 | 5,862.97 | +4.01 | 0.1774 | 0.1706 | 6.96 | 14.01 |
| standalone | 3,012.42 | 2,824.86 | -6.23 | 0.3320 | 0.3540 | 7.89 | 18.06 |

## Full benchmark/bench.js suite

All 30 existing cases, unchanged; values are the median of three per-run throughput means.

| Case | Before ops/sec | After ops/sec | Δ % | Before CV % | After CV % |
| --- | ---: | ---: | ---: | ---: | ---: |
| short string | 18,336,629.00 | 18,200,481.00 | -0.74 | 7.38 | 8.47 |
| unsafe short string | 20,407,606.00 | 20,018,661.00 | -1.91 | 5.15 | 26.72 |
| short string with double quote | 13,540,212.00 | 13,673,382.00 | +0.98 | 13.90 | 33.85 |
| long string without double quotes | 55,558.00 | 52,680.00 | -5.18 | 5.84 | 28.04 |
| unsafe long string without double quotes | 185,616.00 | 153,732.00 | -17.18 | 9.20 | 34.31 |
| long string | 47,211.00 | 41,741.00 | -11.59 | 8.75 | 33.23 |
| unsafe long string | 187,382.00 | 161,153.00 | -14.00 | 8.89 | 33.41 |
| number | 26,308,639.00 | 21,687,613.00 | -17.56 | 12.43 | 9.13 |
| integer | 24,596,881.00 | 24,741,026.00 | +0.59 | 11.63 | 9.72 |
| formatted date-time | 2,249,500.00 | 2,292,748.00 | +1.92 | 9.72 | 29.19 |
| formatted date | 2,012,971.00 | 2,012,432.00 | -0.03 | 11.83 | 35.12 |
| formatted time | 2,070,497.00 | 2,052,614.00 | -0.86 | 12.07 | 29.64 |
| short array of numbers | 75,884.00 | 74,644.00 | -1.63 | 14.61 | 32.08 |
| short array of integers | 75,627.00 | 73,534.00 | -2.77 | 12.63 | 31.41 |
| short array of short strings | 29,396.00 | 30,383.00 | +3.36 | 12.32 | 31.70 |
| short array of long strings | 30,342.00 | 31,239.00 | +2.96 | 11.51 | 35.63 |
| short array of objects with properties of different types | 13,787.00 | 14,348.00 | +4.07 | 12.26 | 35.20 |
| object with number property | 23,107,444.00 | 23,699,437.00 | +2.56 | 2.41 | 21.48 |
| object with integer property | 23,463,572.00 | 22,149,954.00 | -5.60 | 2.02 | 16.54 |
| object with short string property | 15,742,641.00 | 15,607,480.00 | -0.86 | 12.15 | 33.77 |
| object with long string property | 39,983.00 | 38,197.00 | -4.47 | 8.50 | 27.85 |
| object with properties of different types | 2,923,426.00 | 2,802,109.00 | -4.15 | 9.62 | 27.53 |
| simple object | 9,361,921.00 | 8,974,462.00 | -4.14 | 10.62 | 29.65 |
| simple object with required fields | 9,055,028.00 | 9,074,099.00 | +0.21 | 13.76 | 31.32 |
| oneOf external refs compile and first stringify | 887.00 | 635.00 | -28.41 | 40.88 | 52.43 |
| object with const string property | 21,468,474.00 | 21,754,057.00 | +1.33 | 5.99 | 26.09 |
| object with const number property | 23,393,142.00 | 19,937,331.00 | -14.77 | 9.31 | 7.99 |
| object with const bool property | 23,204,237.00 | 20,062,911.00 | -13.54 | 5.79 | 7.89 |
| object with const object property | 21,408,838.00 | 21,163,400.00 | -1.15 | 5.61 | 30.10 |
| object with const null property | 24,219,382.00 | 20,951,079.00 | -13.49 | 1.69 | 9.73 |

## Findings and verdict

**Recommendation: merge the harness and profiling evidence; follow up on optimization.**
There is no production-code optimization on this branch and no measured runtime win is
claimed. All requested fixtures, three-run baseline/branch tables and CPU profiles are
present. The ranked experiments in [profile.md](profile.md) are proposals for separate
branches, with allocation/GC, number conversion, schema traversal and Ajv setup the
strongest leads from these samples.

The control comparison demonstrates substantial noise: unchanged full-suite medians
range from **−28.41% to +4.07%**, with **14 of 30** cases appearing slower by more than
2%. The union compile-and-first-stringify case has before/after CVs of **40.88% / 52.43%**.
Apparent targeted gains are also non-causal: decimal arrays at 1e5 show **133.82 →
201.06 ops/sec (+50.25%)** despite identical production source. This run does **not**
establish the contract's >5% win / <=2% regression gate for any runtime change.
A quiet-host rerun is necessary before accepting a future optimization on those bounds.

At 1e5 elements, baseline default / native throughput is **774.41 / 1,602.08** for
integers, **133.82 / 393.65** for decimals, **258.54 / 579.19** for short strings,
**37.89 / 68.20** for quoted long strings, **104.68 / 127.73** for flat objects,
**15.68 / 44.58** for nested objects, and **215.38 / 323.10** for nullable numbers.
These are comparisons on the chosen fixtures, not permission to use native serialization
for inputs whose schema semantics differ.

## Validation

- `npm test`: **passed**, 587 tests, zero failures, 100% statements/branches/functions/lines
  in the configured production coverage set; TypeScript: 15 assertions passed.
- `npm run lint`: **passed** (the current npm test script does not include ESLint, so it
  was run explicitly).
- Both new scripts completed three times on each checkout with their full default
  workloads; `--json` only enabled persistence. Both emit Markdown tables.
- All 30 existing benchmark cases completed three times per checkout.
- All 19 CPU workloads completed; every compressed profile was independently re-read
  by the summary script, and the measured-phase duration checks passed.
- `git diff` against the base is empty for `index.js`, `lib/`, `package.json`,
  `benchmark/bench.js` and `benchmark/bench-thread.js`. Only benchmark and experiment
  files are part of this change.

## Risks and follow-up

1. Shared-host load, variable GC and small minimum sample counts at 1e6 make the current
   numbers unsuitable for a 2% regression gate. Three medians and sample variance/CV
   are retained, but they do not eliminate systematic load or execution-order effects.
2. The chosen fixtures are deterministic and intentionally narrow. Quoted long strings
   repeat the same value; real workloads may contain unique strings, Unicode, coercible
   values, sparse arrays, getters, toJSON or malformed input. Existing semantic tests and
   additional adversarial equivalence/error checks remain mandatory for future changes.
3. Both FJS mechanisms reject typed arrays. Native typed-array rows describe objects,
   and substituting Array.from would measure a different operation and alter semantics.
4. Build measurements reuse a schema after warmup and exclude first serialization.
   Union validator compilation can be paid later by default; standalone measures source
   generation only. Cold module load and generated-module startup require separate tests.
5. CPU profiles are short, sample-weighted and include opaque native/V8 frames. They
   suggest where to investigate; no percentage is a promised speedup. See profile.md
   for per-hypothesis semantic risks.
6. The inherited full-suite case named `short array of long strings` actually uses the
   short-string fixture in bench.js. It was kept unchanged for the control comparison;
   the new harness supplies a real quoted-long-string array case. Correcting that old
   fixture should be an explicitly identified benchmark change in a separate comparison.

Raw run values, sample variance in squared units and CV are preserved in
[`aggregate.json`](results/bench-harness-profile/aggregate.json), alongside all original
Markdown/JSON runs and compressed CPU profiles. No package version or public API changed.
