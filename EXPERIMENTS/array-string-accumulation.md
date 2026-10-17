# Array string accumulation experiment

Recommendation: **reject** the blanket accumulation rewrites; retain the existing production `buildArray()` implementation. The benchmark-only implementations and regression tests are retained to make the negative result reproducible.

## Hypothesis and implementation

The two homogeneous-array loops in `index.js::buildArray()` append separators and serialized values to a growing string. Reducing the number or depth of V8 cons-string links might improve serialization of 20,000–1,000,000 elements without changing output, exceptions, or access order.

`benchmark/array-accumulation-variants.js` substitutes exactly those two loop templates in memory, in the named-function and inline paths. It leaves tuple handling, schema validation, nullable behavior, the `json-stringify` large-array mechanism, and production files unchanged. There are no new public options. `lib/serializer.js` and the package version are unchanged.

| Variant | Generated strategy |
|---|---|
| Baseline | Unmodified `feature/speedup` at `d335e9c21ddc12f5f365991b55d65df3d0825098` |
| Local | Serialize each value in a block with a fresh, shadowed `let json = ''`; assign that string to `item`, then append it to the outer accumulator. This preserves the existing generated item code verbatim. |
| Flatten | Call `%FlattenString(json)` after every 8,192 loop iterations. This is an experimental native intrinsic, never a production requirement. |
| Join | Serialize each item locally, `parts.push(item)`, then append `parts.join(JSON_STR_COMMA)` for the body. |
| Unroll ×4 | Emit four sequential item blocks per main-loop iteration, followed by a remainder loop. Use the original loop when a proxy supplies a nonnumeric length, preserving coercion side effects. |
| Comma | Serialize locally as in Local; use one `json += JSON_STR_COMMA + item` instead of separate comma and item appends. |

The 1,024-item flattening interval was explored first and aborted during the million-element long-string case because of excessive repeated copying. Those incomplete exploratory measurements are excluded from all reported tables. All complete Flatten measurements use 8,192.

## V8 flattening verification

`node --allow-natives-syntax benchmark/probe-array-flattening.js` builds a cons string and inspects it using `%DebugPrint` before and after each operation. Both `.concat('')` and reading `.length` return the same `CONS_ONE_BYTE_STRING_TYPE` object. `%FlattenString` returns a distinct `SEQ_ONE_BYTE_STRING_TYPE` object. The full diagnostic output is in [the V8 probe output](array-string-accumulation-data/flattening-probe.txt); the benchmark uses the operation that demonstrably flattens.

## Measurement method

- Node **v24.19.0**, macOS arm64, **Apple M5 Pro**, 48 GiB RAM, same machine and checkout for all variants. Dependencies already existed; no installation or dependency changes were needed.
- Baseline source equals the `feature/speedup` commit above. Each candidate is loaded from that same source with only the two loop substitutions, avoiding checkout/dependency drift.
- Created the missing `benchmark/bench-large-array.js` and `benchmark/bench-compile.js`, using the existing `tinybench` 6.2.1 dependency and throughput statistic from `benchmark/bench-thread.js`.
- Large matrix: 1,000 / 20,000 / 100,000 / 1,000,000 elements × six kinds × both paths. Integer values cycle modulo 10,000; numbers add 0.25; short strings are 7–8 characters; long strings are 132 characters including escapes; flat objects have three scalar properties; nested objects contain an object and a three-integer array. Long-string output at one million elements is 138,000,001 bytes.
- Each matrix configuration and compilation suite runs **three times**, with variant order rotated between repetitions. Large tasks use 200 ms measurement, at least two samples, and 50 ms warmup with at least one sample; expensive cases exceed these times. Compilation tasks use 500 ms, at least ten samples, and 100 ms warmup with at least three samples.
- Every timed serialization includes `Buffer.byteLength(result)`, matching the existing full-suite harness and accounting for eventual flattening. Large-array outputs are checked byte-for-byte against `JSON.stringify` before timing.
- The complete, unchanged **30-case `benchmark/bench.js` suite** is run three times each for Baseline and the strongest remaining candidate. Its existing defaults, worker isolation, data generation, and `Buffer.byteLength` calls are preserved. The existing case named “short array of long strings” actually supplies short strings; it is deliberately unchanged, while the new large-array matrix includes real long strings.
- Each table cell reports **median ops/sec (CV%)** across the three independent runs. CV is sample standard deviation divided by the mean, not the within-run confidence interval. Higher ops/sec is better. The [raw results file](array-string-accumulation-data/results.json) also includes each run's throughput, RME, sample count, and the sample variance in squared ops/sec.
- This was a shared workstation with other processes and benchmark workers active. Large-allocation cases can have only two timed samples and substantial GC/scheduling variance. Differences near the 2% gate cannot establish a reliable win on this evidence.

## Verdict and acceptance check

The strongest strategy by the geometric mean across the 36 large-array cases (both paths, sizes at least 20,000) is **Unroll ×4: +10.2%**. It nevertheless has **11 of 36 large cases** below -2%, including **20,000 inline numbers: 881.74 → 720.05 ops/sec (-18.3%)**, and **6 of 12 small cases** below -2%, including **1,000 inline numbers: 23,123.41 → 18,138.43 ops/sec (-21.6%)**. The acceptance rule requires avoiding these regressions, not merely improving an average.

| Variant | Large geometric-mean change | Large cases >+5% / 36 | Large cases <-2% / 36 | Small cases <-2% / 12 | Worst small change |
|---|---:|---:|---:|---:|---:|
| local | -8.8% | 8 | 22 | 8 | -14.9% |
| flatten | -24.0% | 11 | 18 | 3 | -23.7% |
| join | -30.1% | 7 | 26 | 12 | -47.6% |
| unroll4 | +10.2% | 20 | 11 | 6 | -21.6% |
| comma | -17.2% | 4 | 27 | 11 | -21.5% |

In the full suite, **6 of 30 median comparisons** are below -2%; the worst is **oneOf external refs compile and first stringify: -28.8%**. The complete table is below. This is a failed acceptance check, not proof that every observed difference is caused by unrolling: the unchanged scalar cases and reported CV show substantial shared-machine noise.

**Reject the blanket production rewrite.** Keep the baseline, the reproducible benchmark implementations, and the semantic regression tests. Native flattening is costly, join has an actual output counterexample, and the remaining strategies do not clear the required gates. A thresholded or item-specific unroll experiment on a quieter machine is optional follow-up.

## Complete measurements

### Inline arrays

| Size / kind | Baseline | Local | Flatten | Join | Unroll ×4 | Comma |
|---|---:|---:|---:|---:|---:|---:|
| 1000 / integer | 117,534.92 (17.8%) | 107,741.07 (6.3%) | 89,713.66 (11.2%) | 61,569.12 (18.1%) | 97,188.05 (11.5%) | 99,822.16 (5.3%) |
| 1000 / number | 23,123.41 (29.7%) | 19,808.90 (11.4%) | 19,398.27 (17.9%) | 15,016.03 (19.5%) | 18,138.43 (15.8%) | 18,161.88 (12.0%) |
| 1000 / short-string | 38,105.72 (13.0%) | 34,714.21 (6.5%) | 37,167.85 (10.7%) | 27,823.47 (12.3%) | 34,968.25 (8.3%) | 32,761.32 (5.0%) |
| 1000 / long-string | 4,684.94 (27.1%) | 3,988.09 (5.5%) | 4,765.49 (16.0%) | 3,436.22 (13.9%) | 3,892.55 (11.5%) | 3,817.40 (13.2%) |
| 1000 / flat-object | 18,227.45 (17.4%) | 17,053.30 (7.4%) | 17,934.53 (6.9%) | 13,568.00 (9.2%) | 15,625.01 (8.3%) | 15,754.28 (6.1%) |
| 1000 / nested-object | 8,066.02 (25.1%) | 7,625.54 (8.9%) | 8,609.42 (11.4%) | 4,860.68 (14.3%) | 7,097.74 (5.5%) | 7,378.77 (7.9%) |
| 20000 / integer | 4,853.08 (20.0%) | 4,118.24 (22.7%) | 4,971.29 (9.6%) | 2,440.71 (22.3%) | 4,267.43 (4.9%) | 3,902.78 (12.1%) |
| 20000 / number | 881.74 (34.4%) | 768.95 (25.8%) | 927.61 (19.0%) | 650.13 (23.5%) | 720.05 (9.0%) | 716.40 (24.3%) |
| 20000 / short-string | 1,542.61 (26.1%) | 1,552.57 (27.2%) | 1,656.53 (9.8%) | 1,085.10 (18.4%) | 1,443.26 (7.3%) | 1,376.97 (12.9%) |
| 20000 / long-string | 206.59 (36.4%) | 211.82 (37.1%) | 204.88 (14.7%) | 174.90 (26.3%) | 195.75 (7.5%) | 159.59 (18.0%) |
| 20000 / flat-object | 674.49 (29.8%) | 759.68 (14.1%) | 691.21 (16.5%) | 422.54 (30.4%) | 671.87 (6.0%) | 604.66 (21.9%) |
| 20000 / nested-object | 290.73 (38.6%) | 314.06 (45.8%) | 333.19 (14.2%) | 133.60 (40.1%) | 288.45 (8.8%) | 290.19 (20.7%) |
| 100000 / integer | 666.96 (36.8%) | 724.93 (23.6%) | 683.85 (22.5%) | 217.55 (51.3%) | 774.22 (12.6%) | 589.03 (18.4%) |
| 100000 / number | 150.02 (52.3%) | 153.57 (32.2%) | 183.69 (24.9%) | 66.28 (60.2%) | 171.83 (24.0%) | 126.77 (18.6%) |
| 100000 / short-string | 262.30 (32.7%) | 289.41 (23.9%) | 267.74 (21.2%) | 165.87 (33.1%) | 319.90 (13.9%) | 234.63 (14.5%) |
| 100000 / long-string | 36.71 (37.6%) | 37.18 (67.8%) | 30.98 (24.0%) | 27.54 (52.1%) | 44.28 (24.5%) | 28.09 (21.1%) |
| 100000 / flat-object | 98.70 (42.6%) | 131.54 (33.0%) | 100.18 (24.9%) | 64.18 (37.3%) | 153.86 (22.7%) | 85.18 (28.9%) |
| 100000 / nested-object | 36.09 (41.6%) | 45.43 (48.0%) | 49.81 (28.7%) | 10.29 (71.0%) | 51.21 (24.3%) | 35.82 (59.6%) |
| 1000000 / integer | 56.27 (49.9%) | 69.28 (40.6%) | 20.59 (35.6%) | 15.48 (78.7%) | 86.56 (16.6%) | 40.77 (36.7%) |
| 1000000 / number | 12.05 (30.3%) | 12.63 (67.5%) | 8.60 (28.5%) | 5.10 (86.7%) | 14.32 (24.3%) | 7.16 (63.2%) |
| 1000000 / short-string | 11.01 (29.3%) | 13.38 (71.1%) | 7.85 (23.4%) | 6.21 (56.5%) | 10.60 (21.5%) | 16.00 (58.2%) |
| 1000000 / long-string | 2.71 (24.7%) | 2.80 (55.1%) | 0.57 (13.8%) | 1.62 (60.7%) | 2.66 (9.5%) | 1.30 (51.0%) |
| 1000000 / flat-object | 3.73 (28.9%) | 3.10 (69.7%) | 2.40 (33.9%) | 4.94 (27.4%) | 3.82 (15.8%) | 1.31 (26.3%) |
| 1000000 / nested-object | 1.83 (21.3%) | 1.78 (72.0%) | 0.93 (31.8%) | 2.10 (59.5%) | 1.69 (18.0%) | 0.88 (5.0%) |

### Named arrays

| Size / kind | Baseline | Local | Flatten | Join | Unroll ×4 | Comma |
|---|---:|---:|---:|---:|---:|---:|
| 1000 / integer | 97,126.32 (20.1%) | 93,619.52 (11.5%) | 101,187.48 (5.8%) | 64,708.27 (14.8%) | 100,287.75 (8.6%) | 94,582.28 (33.3%) |
| 1000 / number | 17,324.98 (26.7%) | 18,213.45 (20.9%) | 20,121.54 (11.5%) | 16,193.27 (17.5%) | 17,496.86 (12.3%) | 16,424.19 (6.6%) |
| 1000 / short-string | 34,518.49 (11.2%) | 35,585.35 (5.7%) | 36,448.41 (6.4%) | 27,320.95 (13.9%) | 35,241.19 (11.4%) | 30,948.73 (4.8%) |
| 1000 / long-string | 3,752.73 (21.1%) | 3,627.02 (16.2%) | 4,237.87 (9.7%) | 3,295.56 (20.3%) | 3,753.11 (15.6%) | 3,563.00 (5.6%) |
| 1000 / flat-object | 16,271.69 (14.0%) | 16,596.06 (6.7%) | 17,121.65 (12.1%) | 13,455.56 (12.1%) | 16,142.87 (9.1%) | 15,145.85 (1.2%) |
| 1000 / nested-object | 7,150.92 (16.7%) | 7,317.83 (17.2%) | 7,760.48 (7.7%) | 4,996.76 (13.7%) | 7,351.14 (10.0%) | 7,216.94 (2.3%) |
| 20000 / integer | 4,496.90 (27.7%) | 4,194.19 (18.3%) | 3,745.42 (12.5%) | 2,591.00 (17.2%) | 4,586.53 (14.1%) | 4,173.66 (3.8%) |
| 20000 / number | 822.24 (33.9%) | 734.02 (33.0%) | 916.89 (19.5%) | 845.12 (27.7%) | 751.11 (25.2%) | 794.74 (12.1%) |
| 20000 / short-string | 1,576.60 (19.4%) | 1,289.05 (18.1%) | 1,416.58 (10.3%) | 1,375.38 (22.3%) | 1,390.31 (12.3%) | 1,333.25 (15.2%) |
| 20000 / long-string | 206.69 (42.2%) | 130.56 (35.5%) | 199.07 (12.0%) | 188.62 (36.5%) | 179.35 (13.0%) | 170.22 (31.5%) |
| 20000 / flat-object | 640.34 (31.2%) | 568.73 (24.8%) | 679.08 (11.4%) | 527.96 (31.1%) | 697.54 (14.5%) | 584.62 (39.0%) |
| 20000 / nested-object | 284.18 (39.8%) | 277.57 (26.0%) | 327.67 (30.9%) | 214.05 (33.9%) | 316.93 (13.2%) | 254.70 (37.1%) |
| 100000 / integer | 606.12 (37.7%) | 546.31 (36.5%) | 633.70 (25.9%) | 485.33 (28.5%) | 822.21 (19.2%) | 622.61 (25.6%) |
| 100000 / number | 133.76 (45.4%) | 89.57 (15.6%) | 169.81 (36.8%) | 153.78 (26.0%) | 156.60 (23.3%) | 126.49 (37.4%) |
| 100000 / short-string | 237.90 (32.7%) | 228.06 (18.4%) | 264.48 (14.4%) | 234.98 (26.2%) | 284.62 (13.8%) | 201.96 (26.5%) |
| 100000 / long-string | 26.93 (71.5%) | 23.63 (41.0%) | 21.06 (46.6%) | 31.18 (37.7%) | 37.03 (12.6%) | 25.13 (36.1%) |
| 100000 / flat-object | 103.36 (44.6%) | 74.62 (50.0%) | 79.88 (11.6%) | 55.56 (25.8%) | 127.22 (11.7%) | 107.80 (24.6%) |
| 100000 / nested-object | 34.81 (55.0%) | 21.69 (75.4%) | 46.39 (14.5%) | 14.99 (45.8%) | 40.42 (11.6%) | 27.39 (26.7%) |
| 1000000 / integer | 52.63 (46.9%) | 36.34 (88.0%) | 17.40 (21.0%) | 18.53 (72.6%) | 58.42 (7.8%) | 37.78 (41.7%) |
| 1000000 / number | 7.34 (63.0%) | 5.39 (83.0%) | 5.83 (50.5%) | 8.45 (59.9%) | 11.31 (18.6%) | 8.88 (48.3%) |
| 1000000 / short-string | 7.28 (66.9%) | 4.96 (83.4%) | 3.28 (61.3%) | 11.34 (70.3%) | 10.50 (14.1%) | 8.28 (57.5%) |
| 1000000 / long-string | 1.91 (41.5%) | 1.64 (76.2%) | 0.28 (65.5%) | 1.95 (42.8%) | 1.81 (41.6%) | 2.24 (57.4%) |
| 1000000 / flat-object | 3.41 (17.4%) | 2.59 (62.1%) | 1.23 (66.4%) | 4.37 (44.4%) | 3.95 (28.2%) | 3.37 (31.0%) |
| 1000000 / nested-object | 1.88 (17.0%) | 1.38 (73.4%) | 0.51 (73.4%) | 1.70 (57.9%) | 1.57 (15.7%) | 0.63 (72.2%) |

### Compilation

| Schema | Baseline | Local | Flatten | Join | Unroll ×4 | Comma |
|---|---:|---:|---:|---:|---:|---:|
| small | 19,931.81 (16.5%) | 16,316.59 (26.9%) | 16,937.28 (20.5%) | 18,288.08 (15.6%) | 15,559.80 (5.5%) | 16,624.49 (22.9%) |
| wide | 2,387.46 (22.5%) | 2,247.91 (29.9%) | 2,090.66 (25.4%) | 2,889.41 (23.3%) | 1,523.58 (11.6%) | 2,140.05 (25.9%) |
| deep | 10,330.52 (15.0%) | 9,049.21 (24.1%) | 9,044.42 (17.5%) | 8,057.88 (16.5%) | 9,316.72 (2.3%) | 8,543.48 (18.8%) |
| $ref-heavy | 5,644.73 (20.3%) | 4,843.04 (29.1%) | 4,436.05 (24.8%) | 5,287.22 (10.2%) | 4,056.29 (12.7%) | 3,950.31 (28.8%) |

### Full benchmark/bench.js suite

| Case | Baseline | unroll4 | Change |
|---|---:|---:|---:|
| short string | 10,906,777.00 (43.7%) | 19,706,722.00 (34.1%) | +80.7% |
| unsafe short string | 12,326,898.00 (30.2%) | 20,437,412.00 (32.7%) | +65.8% |
| short string with double quote | 8,430,830.00 (47.1%) | 12,723,947.00 (32.0%) | +50.9% |
| long string without double quotes | 32,293.00 (41.6%) | 49,944.00 (27.8%) | +54.7% |
| unsafe long string without double quotes | 92,999.00 (52.0%) | 153,029.00 (32.4%) | +64.5% |
| long string | 25,221.00 (42.8%) | 40,406.00 (34.5%) | +60.2% |
| unsafe long string | 94,327.00 (42.5%) | 153,646.00 (31.2%) | +62.9% |
| number | 21,539,997.00 (13.6%) | 23,542,529.00 (13.8%) | +9.3% |
| integer | 21,351,343.00 (11.5%) | 21,040,972.00 (7.3%) | -1.5% |
| formatted date-time | 1,462,270.00 (36.7%) | 2,185,186.00 (26.4%) | +49.4% |
| formatted date | 1,253,869.00 (37.1%) | 1,951,066.00 (27.0%) | +55.6% |
| formatted time | 1,293,025.00 (36.3%) | 1,959,876.00 (26.8%) | +51.6% |
| short array of numbers | 38,841.00 (53.2%) | 72,894.00 (27.6%) | +87.7% |
| short array of integers | 40,370.00 (59.0%) | 71,243.00 (28.1%) | +76.5% |
| short array of short strings | 15,750.00 (51.6%) | 28,319.00 (32.1%) | +79.8% |
| short array of long strings | 16,635.00 (47.3%) | 27,982.00 (32.2%) | +68.2% |
| short array of objects with properties of different types | 7,843.00 (46.7%) | 13,010.00 (29.3%) | +65.9% |
| object with number property | 16,737,937.00 (28.0%) | 23,049,405.00 (16.5%) | +37.7% |
| object with integer property | 17,100,419.00 (24.3%) | 23,176,160.00 (19.2%) | +35.5% |
| object with short string property | 8,558,309.00 (50.5%) | 13,368,129.00 (27.0%) | +56.2% |
| object with long string property | 22,717.00 (44.1%) | 23,840.00 (28.4%) | +4.9% |
| object with properties of different types | 1,759,455.00 (39.1%) | 1,777,496.00 (28.9%) | +1.0% |
| simple object | 5,474,069.00 (43.1%) | 5,316,843.00 (29.3%) | -2.9% |
| simple object with required fields | 5,430,015.00 (41.0%) | 5,295,904.00 (28.9%) | -2.5% |
| oneOf external refs compile and first stringify | 285.00 (112.1%) | 203.00 (80.3%) | -28.8% |
| object with const string property | 12,592,177.00 (37.7%) | 12,168,034.00 (33.3%) | -3.4% |
| object with const number property | 18,509,242.00 (21.1%) | 18,614,535.00 (20.1%) | +0.6% |
| object with const bool property | 18,523,014.00 (18.4%) | 18,045,860.00 (16.7%) | -2.6% |
| object with const object property | 12,683,365.00 (37.0%) | 12,075,534.00 (36.6%) | -4.8% |
| object with const null property | 18,724,021.00 (16.1%) | 18,923,425.00 (15.4%) | +1.1% |

## Semantic validation and risks

`npm test` passed **595 tests**, with **100% statement, branch, function, and line coverage**, plus **15 TypeScript assertions**. `npm run lint` passed. The standalone experiment check passed **552 differential output/error/access-order checks**, including nullable values, sparse arrays, unknown schemas, nested arrays/objects, union selection, coercions, getter exceptions, `toJSON`, both paths, the `json-stringify` option, and loop/flatten boundaries.

Two important observable behaviors were checked explicitly:

1. **Proxy length coercion:** a proxy may return an object for `length`. An unguarded four-way loop changes the number of `valueOf` calls and can serialize `[0,1,2,3,4]` where the baseline emits `[0,1]`. The measured unroll implementation includes a fallback for nonnumeric lengths; that guard was added before any unroll timing. The regression test also checks the baseline's three coercions.
2. **Join is not semantically equivalent:** an item's `toString()` can replace `Array.prototype.join`. The baseline still emits `["x","y"]`, whereas the tested join candidate emits `[changed]`. The diagnostic asserts this counterexample in both paths, separately from the passing differential cases, and restores the original method in `finally`. Join is rejected on semantics independently of speed. The new production regression test protects the existing output.

`test/array-accumulation.test.js` adds eight regression tests covering those cases, loop boundaries, and read/serialize order. Production `index.js`, `lib/serializer.js`, and `package.json` have no changes, so no experimental runtime behavior ships.

Additional limitations:

- The benchmark loader uses Node's internal `Module._compile` and exact source-template matching. It is an experiment tool, with a deliberate failure if either loop template changes, not a public API or runtime option.
- Native flattening requires `--allow-natives-syntax` and is V8-specific. Fixed-interval prefix flattening has quadratic cumulative copying for a fixed item width; `concat('')` and `.length` are not alternatives that perform the same operation.
- Local grouping and comma grouping create additional temporary strings; joining retains an array of all item strings; unrolling enlarges generated functions. The compile table captures the prototype generator's overhead as well as generated-code size.
- Comma grouping is measured against the Local strategy using the same serialized `item`, isolating `json += comma; json += item` versus `json += comma + item`. Direct fusion of the first append expression for selected primitive schemas is a possible separate follow-up.
- Shared-machine contention and GC cause substantial variance in several cases. A quiet-machine rerun with more samples is needed before treating the isolated positive medians as reliable improvements. The experiment establishes no blanket optimization that clears the required no-regression gate.

## Reproduction

Run from this branch on Node 24, using a **fresh output directory**; the driver resumes existing `.done` files. It runs variants serially and rotates order across three repetitions. The first command below runs all five strategies and baseline through the complete large-array and compilation suites; the second runs all 30 original full-suite cases for baseline and the strongest candidate.

```sh
node benchmark/run-array-accumulation.js /tmp/fjs-array-accumulation-repro
FJS_SUITES=full FJS_VARIANTS=baseline,unroll4 node benchmark/run-array-accumulation.js /tmp/fjs-array-accumulation-repro
node --allow-natives-syntax benchmark/probe-array-flattening.js
node --allow-natives-syntax benchmark/check-array-accumulation.js
npm test
npm run lint
```

The driver invokes the actual `benchmark/bench-large-array.js`, `benchmark/bench-compile.js`, and `benchmark/bench.js` entry points with `--expose-gc --allow-natives-syntax` and the experiment preload. For an individual candidate, set `FJS_ARRAY_VARIANT` to `baseline`, `local`, `flatten`, `join`, `unroll4`, or `comma`; the standalone large-array and compilation scripts load it directly. To run the original full suite with a candidate manually, use:

```sh
FJS_ARRAY_VARIANT=unroll4 node --expose-gc --allow-natives-syntax -r ./benchmark/array-accumulation-variants.js benchmark/bench.js
```

The experiment code and completed matrix were checkpointed in commit `c3c031c` before the final full-suite results were appended. The recommendation is to retain the baseline and keep this branch as a reproducible negative experiment; any thresholded or item-specific unroll optimization should be a new experiment with a quieter benchmark window.
