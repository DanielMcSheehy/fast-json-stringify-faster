# CPU profiles: large arrays and compilation

Production source is unchanged from `feature/speedup` commit
`d335e9c21ddc12f5f365991b55d65df3d0825098`. Measurements use Node v24.19.0 on
an Apple M5 Pro; see [baseline.md](baseline.md) for the full environment and fixtures.

## Collection and attribution

The workload uses 100,000-element arrays for every input kind. Each supported ordinary
array kind is profiled separately with both `default` and `json-stringify`. Float64Array
and Int32Array are profiled with native JSON.stringify only, because FJS rejects them;
their profiles describe indexed-object output, not a supported FJS array fast path.
Build profiles cover the wide (200 properties), deep (20 objects), and $ref-heavy
(50 definitions/references) schemas. Profiles are taken in separate processes,
after the throughput benchmark batch, using 500 ms warmup and at least 2 seconds
of measured calls, with `--cpu-prof-interval=1000` (microseconds).

Fixture setup, module loading and build for serialization cases precede warmup.
Serialization includes `Buffer.byteLength()`; build profiling excludes serialization.
The summary identifies the first and last samples under the distinct `measureWorkload`
stack frame and sums sampled time deltas over that interval, including intervening
GC/program samples. This avoids assuming that V8's profiler and process.hrtime have
the same clock origin (they do not on this machine). The summary checks the sampled
interval against the separately recorded wall duration within 50 ms. The edges are
approximate by a sampling interval, not exact stopwatch boundaries.

Percentages below are **exclusive sampled self time**, weighted by the profile's
time deltas and divided by all samples in the measured interval. They are not
inclusive stack cost or an instruction count. Native builtin time may be charged
to its JavaScript caller (for example JSON.stringify to `anonymous0` or
`serializeFixture`); a hot caller does not imply that removing its wrapper would
remove that cost. GC and V8 pseudo-frames are retained, and anonymous generated
code is labeled explicitly. The shared host can distort timing through scheduling;
small percentage differences are not precise CPU-budget estimates.

Each table lists the top ten observed self-time functions; when fewer than ten have
positive samples, it lists every observed function instead of inventing zero-cost
entries. Complete per-function summaries, workload windows and compressed raw V8
profiles are retained in `results/bench-harness-profile/profiles/`.

## Reproduce

```sh
node --cpu-prof --cpu-prof-interval=1000 --cpu-prof-dir=/tmp --cpu-prof-name=integer.cpuprofile \
  benchmark/profile-workload.js --kind integer > /tmp/integer-window.json
node benchmark/profile-summary.js /tmp/integer.cpuprofile /tmp/integer-window.json

node --cpu-prof --cpu-prof-interval=1000 --cpu-prof-dir=/tmp --cpu-prof-name=wide.cpuprofile \
  benchmark/profile-workload.js --case wide > /tmp/wide-window.json
node benchmark/profile-summary.js /tmp/wide.cpuprofile /tmp/wide-window.json

# Other selectors: --kind nested-object --mechanism json-stringify,
# --kind Float64Array --mechanism native, --case deep, --case refs.
# The summary also accepts a .cpuprofile.gz file directly.
```

<!-- generated profiles -->

## Top self-time functions by case

### array-Float64Array-native

20 measured calls; 488 positive-duration samples; 2050.21 ms of sampled time. [Full summary](results/bench-harness-profile/profiles/array-Float64Array-native-summary.json) · [Raw profile](results/bench-harness-profile/profiles/array-Float64Array-native.cpuprofile.gz)

| Function | File / generated location | Self % |
| --- | --- | ---: |
| `serializeFixture` | `benchmark/profile-workload.js:22` | 93.77 |
| `(garbage collector)` | `(V8)` | 4.49 |
| `(anonymous)` | `(V8)` | 1.02 |
| `runFor` | `benchmark/profile-workload.js:25` | 0.72 |

Only 4 functions/pseudo-frames had positive sampled self time in this interval.

### array-Int32Array-native

35 measured calls; 484 positive-duration samples; 2079.88 ms of sampled time. [Full summary](results/bench-harness-profile/profiles/array-Int32Array-native-summary.json) · [Raw profile](results/bench-harness-profile/profiles/array-Int32Array-native.cpuprofile.gz)

| Function | File / generated location | Self % |
| --- | --- | ---: |
| `serializeFixture` | `benchmark/profile-workload.js:22` | 86.22 |
| `(anonymous)` | `(V8)` | 9.20 |
| `(garbage collector)` | `(V8)` | 4.17 |
| `runFor` | `benchmark/profile-workload.js:25` | 0.40 |

Only 4 functions/pseudo-frames had positive sampled self time in this interval.

### array-flat-object-default

18 measured calls; 557 positive-duration samples; 2120.83 ms of sampled time. [Full summary](results/bench-harness-profile/profiles/array-flat-object-default-summary.json) · [Raw profile](results/bench-harness-profile/profiles/array-flat-object-default.cpuprofile.gz)

| Function | File / generated location | Self % |
| --- | --- | ---: |
| `(garbage collector)` | `(V8)` | 43.93 |
| `(anonymous)` | `(V8)` | 27.69 |
| `serializeFixture` | `benchmark/profile-workload.js:22` | 16.35 |
| `anonymous0` | `(generated code / eval):84` | 11.97 |
| `anonymous1` | `(generated code / eval):32` | 0.06 |
| `(program)` | `(V8)` | 0.00 |

Only 6 functions/pseudo-frames had positive sampled self time in this interval.

### array-flat-object-json-stringify

28 measured calls; 524 positive-duration samples; 2116.42 ms of sampled time. [Full summary](results/bench-harness-profile/profiles/array-flat-object-json-stringify-summary.json) · [Raw profile](results/bench-harness-profile/profiles/array-flat-object-json-stringify.cpuprofile.gz)

| Function | File / generated location | Self % |
| --- | --- | ---: |
| `anonymous0` | `(generated code / eval):84` | 89.79 |
| `(anonymous)` | `(V8)` | 5.95 |
| `(garbage collector)` | `(V8)` | 4.21 |
| `runFor` | `benchmark/profile-workload.js:25` | 0.06 |

Only 4 functions/pseudo-frames had positive sampled self time in this interval.

### array-integer-default

174 measured calls; 692 positive-duration samples; 2009.21 ms of sampled time. [Full summary](results/bench-harness-profile/profiles/array-integer-default-summary.json) · [Raw profile](results/bench-harness-profile/profiles/array-integer-default.cpuprofile.gz)

| Function | File / generated location | Self % |
| --- | --- | ---: |
| `(anonymous)` | `(V8)` | 43.27 |
| `serializeFixture` | `benchmark/profile-workload.js:22` | 21.37 |
| `anonymous0` | `(generated code / eval):31` | 18.03 |
| `(garbage collector)` | `(V8)` | 16.00 |
| `runFor` | `benchmark/profile-workload.js:25` | 1.29 |
| `measureWorkload` | `benchmark/profile-workload.js:39` | 0.05 |
| `(program)` | `(V8)` | 0.00 |

Only 7 functions/pseudo-frames had positive sampled self time in this interval.

### array-integer-json-stringify

312 measured calls; 532 positive-duration samples; 2021.21 ms of sampled time. [Full summary](results/bench-harness-profile/profiles/array-integer-json-stringify-summary.json) · [Raw profile](results/bench-harness-profile/profiles/array-integer-json-stringify.cpuprofile.gz)

| Function | File / generated location | Self % |
| --- | --- | ---: |
| `anonymous0` | `(generated code / eval):31` | 81.60 |
| `(anonymous)` | `(V8)` | 14.84 |
| `(garbage collector)` | `(V8)` | 2.65 |
| `serializeFixture` | `benchmark/profile-workload.js:22` | 0.57 |
| `runFor` | `benchmark/profile-workload.js:25` | 0.33 |
| `measureWorkload` | `benchmark/profile-workload.js:39` | 0.01 |

Only 6 functions/pseudo-frames had positive sampled self time in this interval.

### array-long-string-default

12 measured calls; 541 positive-duration samples; 2189.67 ms of sampled time. [Full summary](results/bench-harness-profile/profiles/array-long-string-default-summary.json) · [Raw profile](results/bench-harness-profile/profiles/array-long-string-default.cpuprofile.gz)

| Function | File / generated location | Self % |
| --- | --- | ---: |
| `asString` | `lib/serializer.js:6` | 60.39 |
| `(anonymous)` | `(V8)` | 15.81 |
| `serializeFixture` | `benchmark/profile-workload.js:22` | 8.28 |
| `(garbage collector)` | `(V8)` | 7.71 |
| `anonymous0` | `(generated code / eval):31` | 5.95 |
| `RegExp: [\u0000-\u001f\u0022\u005c\ud800-\udfff]` | `(V8)` | 1.74 |
| `(program)` | `(V8)` | 0.12 |

Only 7 functions/pseudo-frames had positive sampled self time in this interval.

### array-long-string-json-stringify

18 measured calls; 516 positive-duration samples; 2128.96 ms of sampled time. [Full summary](results/bench-harness-profile/profiles/array-long-string-json-stringify-summary.json) · [Raw profile](results/bench-harness-profile/profiles/array-long-string-json-stringify.cpuprofile.gz)

| Function | File / generated location | Self % |
| --- | --- | ---: |
| `anonymous0` | `(generated code / eval):31` | 87.32 |
| `(anonymous)` | `(V8)` | 10.46 |
| `(garbage collector)` | `(V8)` | 2.06 |
| `runFor` | `benchmark/profile-workload.js:25` | 0.17 |

Only 4 functions/pseudo-frames had positive sampled self time in this interval.

### array-nested-object-default

3 measured calls; 782 positive-duration samples; 2753.50 ms of sampled time. [Full summary](results/bench-harness-profile/profiles/array-nested-object-default-summary.json) · [Raw profile](results/bench-harness-profile/profiles/array-nested-object-default.cpuprofile.gz)

| Function | File / generated location | Self % |
| --- | --- | ---: |
| `(garbage collector)` | `(V8)` | 57.91 |
| `serializeFixture` | `benchmark/profile-workload.js:22` | 12.46 |
| `asNumber` | `lib/serializer.js:79` | 9.39 |
| `(anonymous)` | `(V8)` | 5.96 |
| `anonymous0` | `(generated code / eval):140` | 5.40 |
| `anonymous2` | `(generated code / eval):84` | 3.11 |
| `asInteger` | `lib/serializer.js:63` | 2.74 |
| `anonymous3` | `(generated code / eval):32` | 1.34 |
| `asString` | `lib/serializer.js:130` | 0.69 |
| `(program)` | `(V8)` | 0.56 |

### array-nested-object-json-stringify

10 measured calls; 588 positive-duration samples; 2134.92 ms of sampled time. [Full summary](results/bench-harness-profile/profiles/array-nested-object-json-stringify-summary.json) · [Raw profile](results/bench-harness-profile/profiles/array-nested-object-json-stringify.cpuprofile.gz)

| Function | File / generated location | Self % |
| --- | --- | ---: |
| `anonymous0` | `(generated code / eval):141` | 94.87 |
| `(anonymous)` | `(V8)` | 4.62 |
| `(garbage collector)` | `(V8)` | 0.51 |

Only 3 functions/pseudo-frames had positive sampled self time in this interval.

### array-nullable-number-default

40 measured calls; 506 positive-duration samples; 2002.17 ms of sampled time. [Full summary](results/bench-harness-profile/profiles/array-nullable-number-default-summary.json) · [Raw profile](results/bench-harness-profile/profiles/array-nullable-number-default.cpuprofile.gz)

| Function | File / generated location | Self % |
| --- | --- | ---: |
| `asNumber` | `lib/serializer.js:79` | 51.99 |
| `anonymous0` | `(generated code / eval):31` | 13.99 |
| `serializeFixture` | `benchmark/profile-workload.js:22` | 13.00 |
| `(garbage collector)` | `(V8)` | 11.01 |
| `(anonymous)` | `(V8)` | 9.74 |
| `(program)` | `(V8)` | 0.21 |
| `hrtimeBigInt` | `node:internal/process/per_thread:99` | 0.06 |

Only 7 functions/pseudo-frames had positive sampled self time in this interval.

### array-nullable-number-json-stringify

65 measured calls; 575 positive-duration samples; 2018.33 ms of sampled time. [Full summary](results/bench-harness-profile/profiles/array-nullable-number-json-stringify-summary.json) · [Raw profile](results/bench-harness-profile/profiles/array-nullable-number-json-stringify.cpuprofile.gz)

| Function | File / generated location | Self % |
| --- | --- | ---: |
| `anonymous0` | `(generated code / eval):31` | 96.17 |
| `(anonymous)` | `(V8)` | 2.42 |
| `(garbage collector)` | `(V8)` | 1.41 |

Only 3 functions/pseudo-frames had positive sampled self time in this interval.

### array-number-default

32 measured calls; 548 positive-duration samples; 2050.83 ms of sampled time. [Full summary](results/bench-harness-profile/profiles/array-number-default-summary.json) · [Raw profile](results/bench-harness-profile/profiles/array-number-default.cpuprofile.gz)

| Function | File / generated location | Self % |
| --- | --- | ---: |
| `asNumber` | `lib/serializer.js:79` | 55.93 |
| `(anonymous)` | `(V8)` | 16.95 |
| `(garbage collector)` | `(V8)` | 10.62 |
| `serializeFixture` | `benchmark/profile-workload.js:22` | 8.74 |
| `anonymous0` | `(generated code / eval):31` | 6.99 |
| `(program)` | `(V8)` | 0.51 |
| `runFor` | `benchmark/profile-workload.js:25` | 0.25 |

Only 7 functions/pseudo-frames had positive sampled self time in this interval.

### array-number-json-stringify

122 measured calls; 622 positive-duration samples; 2046.79 ms of sampled time. [Full summary](results/bench-harness-profile/profiles/array-number-json-stringify-summary.json) · [Raw profile](results/bench-harness-profile/profiles/array-number-json-stringify.cpuprofile.gz)

| Function | File / generated location | Self % |
| --- | --- | ---: |
| `anonymous0` | `(generated code / eval):31` | 93.57 |
| `(garbage collector)` | `(V8)` | 4.53 |
| `(anonymous)` | `(V8)` | 1.78 |
| `runFor` | `benchmark/profile-workload.js:25` | 0.06 |
| `hrtimeBigInt` | `node:internal/process/per_thread:99` | 0.06 |

Only 5 functions/pseudo-frames had positive sampled self time in this interval.

### array-short-string-default

80 measured calls; 687 positive-duration samples; 2025.33 ms of sampled time. [Full summary](results/bench-harness-profile/profiles/array-short-string-default-summary.json) · [Raw profile](results/bench-harness-profile/profiles/array-short-string-default.cpuprofile.gz)

| Function | File / generated location | Self % |
| --- | --- | ---: |
| `anonymous0` | `(generated code / eval):31` | 49.08 |
| `serializeFixture` | `benchmark/profile-workload.js:22` | 23.54 |
| `(anonymous)` | `(V8)` | 20.91 |
| `(garbage collector)` | `(V8)` | 5.80 |
| `(program)` | `(V8)` | 0.35 |
| `runFor` | `benchmark/profile-workload.js:25` | 0.20 |
| `asString` | `lib/serializer.js:6` | 0.06 |
| `measureWorkload` | `benchmark/profile-workload.js:39` | 0.06 |

Only 8 functions/pseudo-frames had positive sampled self time in this interval.

### array-short-string-json-stringify

119 measured calls; 442 positive-duration samples; 2002.62 ms of sampled time. [Full summary](results/bench-harness-profile/profiles/array-short-string-json-stringify-summary.json) · [Raw profile](results/bench-harness-profile/profiles/array-short-string-json-stringify.cpuprofile.gz)

| Function | File / generated location | Self % |
| --- | --- | ---: |
| `anonymous0` | `(generated code / eval):31` | 85.43 |
| `(anonymous)` | `(V8)` | 11.21 |
| `(garbage collector)` | `(V8)` | 3.30 |
| `measureWorkload` | `benchmark/profile-workload.js:39` | 0.07 |

Only 4 functions/pseudo-frames had positive sampled self time in this interval.

### build-deep

890 measured calls; 528 positive-duration samples; 2003.08 ms of sampled time. [Full summary](results/bench-harness-profile/profiles/build-deep-summary.json) · [Raw profile](results/bench-harness-profile/profiles/build-deep.cpuprofile.gz)

| Function | File / generated location | Self % |
| --- | --- | ---: |
| `(garbage collector)` | `(V8)` | 10.90 |
| `build` | `index.js:323` | 9.55 |
| `traverse` | `index.js:1231` | 8.74 |
| `addVocabulary` | `node_modules/ajv/dist/core.js:327` | 8.11 |
| `(anonymous)` | `node_modules/ajv/dist/compile/resolve.js:103` | 7.35 |
| `buildObject` | `index.js:796` | 7.08 |
| `addRule` | `node_modules/ajv/dist/core.js:565` | 6.06 |
| `addKeyword` | `node_modules/ajv/dist/core.js:332` | 3.44 |
| `Validator` | `lib/validator.js:10` | 3.10 |
| `getSafeSchemaRef` | `index.js:270` | 3.08 |

### build-refs

443 measured calls; 604 positive-duration samples; 2056.92 ms of sampled time. [Full summary](results/bench-harness-profile/profiles/build-refs-summary.json) · [Raw profile](results/bench-harness-profile/profiles/build-refs.cpuprofile.gz)

| Function | File / generated location | Self % |
| --- | --- | ---: |
| `build` | `index.js:323` | 20.44 |
| `traverse` | `index.js:1231` | 15.75 |
| `validate10` | `lib/schema-validator.js:73` | 10.18 |
| `(garbage collector)` | `(V8)` | 9.63 |
| `buildInnerObject` | `index.js:595` | 9.25 |
| `buildObject` | `index.js:796` | 4.34 |
| `assertObjectDepth` | `index.js:81` | 3.82 |
| `getPropertyLocation` | `lib/location.js:10` | 3.18 |
| `assertSchemaDepth` | `index.js:115` | 1.76 |
| `Ajv` | `node_modules/ajv/dist/ajv.js:10` | 1.71 |

### build-wide

444 measured calls; 522 positive-duration samples; 1999.50 ms of sampled time. [Full summary](results/bench-harness-profile/profiles/build-wide-summary.json) · [Raw profile](results/bench-harness-profile/profiles/build-wide.cpuprofile.gz)

| Function | File / generated location | Self % |
| --- | --- | ---: |
| `traverse` | `index.js:1231` | 15.10 |
| `build` | `index.js:323` | 13.31 |
| `buildInnerObject` | `index.js:595` | 10.98 |
| `(garbage collector)` | `(V8)` | 7.26 |
| `validate10` | `lib/schema-validator.js:73` | 5.89 |
| `assertObjectDepth` | `index.js:81` | 5.38 |
| `parse` | `node_modules/fast-uri/index.js:607` | 4.26 |
| `getPropertyLocation` | `lib/location.js:10` | 3.67 |
| `assertSchemaDepth` | `index.js:115` | 3.27 |
| `addKeyword` | `node_modules/ajv/dist/core.js:332` | 3.10 |

## Ranked optimization hypotheses

These are proposed independent experiments, ranked by measured opportunity and the
ability to preserve semantics. No implementation or speedup is claimed here. Percentages
are sampled self time, not additive predictions of end-to-end speedup.

| Rank | Concrete experiment | Evidence | Required guardrails / next measurement |
| ---: | --- | --- | --- |
| 1 | Change generated object-array accumulation to bounded chunks, flattening/joining at measured chunk boundaries to reduce live intermediate strings. Start with flat and nested arrays. | Default GC: **43.93% flat**, **57.91% nested**, versus **4.21%** and **0.51%** with the existing JSON fallback. At 1e6 items, baseline default is **3.87 / 0.99 ops/sec**, versus native **14.32 / 4.67**. | Preserve property and item access order, coercion, exact bytes and thrown errors. Measure allocation/GC and Buffer.byteLength consumption, not serialization alone; join may increase temporary memory or hurt short arrays. |
| 2 | Generate a direct path for primitive finite numbers inside homogeneous numeric-array loops, retaining the existing helper path for every other value. | `asNumber`: **55.93%** decimal-array self time and **51.99%** nullable-number self time. Baseline 1e5 decimal arrays: default **133.82**, native **393.65 ops/sec**. | Distinguish helper/call overhead from unavoidable number-to-string conversion with a focused experiment. Preserve NaN errors, infinities, negative zero, null handling, numeric strings and object conversion side effects; do not replace general schema serialization with native JSON. |
| 3 | Memoize completed acyclic schema subgraphs within a single recursive-schema discovery pass, with path/depth-aware reuse, rather than revisiting definitions through every reference. | `detectRecursiveSchemas`'s `traverse`: **15.10% wide**, **8.74% deep**, **15.75% refs**. The refs fixture visits 50 definitions directly and through 50 property references; baseline build median is **0.5885 ms**. | A global visited set is insufficient: preserve cycle membership, depth-limit failures at deeper reuse, missing-ref error behavior and schema mutation across separate builds. Measure this traversal alone and total build time. |
| 4 | Delay Ajv/format/vocabulary initialization for serializers that never emit a validation call, while preserving debug/standalone behavior and option checks. | Deep build: `addVocabulary` **8.11%**, `addRule` **6.06%**, `addKeyword` **3.44%**, `Validator` **3.10%**; all Ajv/ajv-formats/validator-file self time totals **38.96%**. Corresponding totals are **12.95% wide** and **11.56% refs**. | The grouped percentage includes all observed Ajv-related frames and is not a direct constructor timing. Preserve eager `compileValidators`, invalid-option errors, custom formats and debug/standalone state; add a schema requiring validation as a control. |
| 5 | Test a per-array last-primitive-string/token cache after existing coercion, avoiding repeated escaping when adjacent primitive strings are identical. | Long-string `asString`: **60.39%** self time. This fixture repeats a 120-character string with quotes, backslashes and newlines; baseline 1e5 default is **37.89 ops/sec** versus native **68.20**. | This opportunity is fixture-specific and may disappear on unique strings. Keep cache lifetime bounded to one call, preserve per-item getters/coercion and escaping, and compare unique strings, Unicode/surrogates and varying lengths before considering a merge. |
| 6 | Cache canonical schema references, parsed URI components and immutable Location-derived paths within each build. | Wide build: fast-uri `parse` **4.26%**, `getPropertyLocation` **3.67%**; deep `getSafeSchemaRef` **3.08%**; refs `getPropertyLocation` **3.18%**. These costs sit beside repeated traversal and code generation. | Use per-build keys that include schema ID and JSON pointer; preserve external IDs, escaped pointers, anchors and exact diagnostic paths. First count duplicate lookups to confirm reuse rather than assume every parse is redundant. |
| 7 | Test bounded chunk accumulation specifically for primitive integer/short-string arrays, keeping small arrays on their current path. | Integer default: consumer `serializeFixture` **21.37%**, GC **16.00%**; short-string default: generated `anonymous0` **49.08%**, consumer **23.54%**, GC **5.80%**. At 1e6 short strings, baseline default is **14.26** versus native **64.79 ops/sec**. | The consumer includes string flattening and calls, and opaque V8 frames cannot be attributed further from this profile. Profile serialization-only versus consumed output as a diagnostic, but retain consumed output for the acceptance comparison; preserve all special-value/error paths. |

Ranks 1 and 7 address different array shapes and should be separate experiments if
pursued. Rank 5 is lower confidence because repeated identical long strings deliberately
stress a narrow workload. Supporting ratios compare mechanisms on equivalent fixtures;
they do not establish a safe general fallback or a guaranteed achievable speedup.

## Limits and rejected shortcuts

The two typed-array profiles provide no evidence for an FJS optimization: accepting
typed arrays would change the existing rejection behavior and is outside the semantics
contract. Native indexed-object serialization is dominated by work charged to
`serializeFixture` (93.77% Float64Array, 86.22% Int32Array); the JavaScript sampler does
not separate its native internals.

Opaque `(anonymous)` V8 frames are retained as unknown rather than assigned to a
specific helper or flattening step. The default integer profile has a particularly large
43.27% opaque share. Sample-weighted results on the busy host should guide experiments,
not be interpreted as precise causal speedup bounds. A follow-up should collect CPU
and allocation profiles on a quiet machine and repeat the full suite before merging
any runtime optimization.
