# Large-array and compilation baseline

Base: `feature/speedup` at `d335e9c21ddc12f5f365991b55d65df3d0825098`.
The baseline was extracted with `git archive`, given the new benchmark files, and used
the same installed dependencies as the experiment checkout. No library code changed
between the before and after runs.

## Measurement protocol

- Node v24.19.0, Apple M5 Pro, 18 logical CPUs, 48 GiB RAM, macOS/Darwin 25.6.0, arm64.
- Three independent invocations of each harness per checkout, interleaved in the order
  before-1, after-1, before-2, after-2, before-3, after-3. Each invocation ran the array,
  compilation, then full existing benchmark suite sequentially. No benchmarks within
  this experiment ran concurrently. Other CPU-heavy Node processes were active on the
  shared machine (observed load averages are in the raw metadata).
- Array cases use tinybench, one fresh worker per size/kind/mechanism, 100 ms warmup
  with at least two calls, and 300 ms measurement with at least eight calls. Timings
  include `Buffer.byteLength()` to consume and flatten the output, matching the existing
  suite. Fixture construction, serializer build, and output-equivalence checks are outside
  the timed section. Large cases may run substantially longer to meet the call minimum.
- Compilation uses tinybench with exactly 100 measured builds after 20 warmup builds,
  one fresh worker per schema. The same schema object is reused within a case; schema
  construction, module loading, and first serialization are excluded. `standalone` measures
  generation of source for the wide schema, not loading or executing that source.
- Tables report the median of the three per-run medians. CV is the sample standard
  deviation of those three values divided by their mean, expressed as a percentage;
  it measures between-run dispersion, not a confidence interval. Per-run latency RME,
  sample counts, mean throughput, and raw values are retained in JSON.
- The full suite retains its existing definition: mean reciprocal per-call latency
  (tinybench throughput mean). Its table takes the median of those three run values.
  It is therefore not the same statistic as the new harness's per-run median throughput.

## Fixtures and semantic boundaries

Sizes are 1,000, 20,000 (the exact default `largeArraySize` boundary), 100,000 and
1,000,000. Integers cycle from -1000 to 1000; numbers divide those values by ten.
Short strings cycle through `hello 0` to `hello 99`. Long strings contain 120 ASCII
characters including quotes, backslashes and newlines (142 encoded bytes per string).
Flat objects have `{s,n,b}`; nested objects have `{id,inner}` with two flat objects in
the inner array. Nullable-number items are null every fourth position and otherwise
`i / 10`. These deterministic fixtures are defined in
[`experiment-fixtures.js`](../benchmark/experiment-fixtures.js).

Every ordinary-array fixture is checked byte-for-byte against native JSON.stringify
for each measured mechanism. This verifies these fixtures only; the existing
`json-stringify` mechanism is **not** a generally equivalent replacement for schema
serialization (coercion, omitted properties, errors, getters and toJSON can differ).

Direct Float64Array and Int32Array input is deliberately retained: both FJS mechanisms
throw TypeError before their size fallback. Their rows say unsupported, and exception
throughput is not measured. Native JSON.stringify serializes typed arrays as indexed
objects, so those native rows are not equivalent JSON-array work. No Array.from
conversion is hidden in a timed operation.

The compilation schemas are a tiny string, a 200-property object, 20 nested objects,
50 distinct definitions referenced by 50 properties, an array of flat objects, an
object containing both oneOf and anyOf, and the wide schema in standalone mode.
Default build options are used, including the default lazy validation behavior;
first-use union validation compilation is outside this build-only measurement.

## Reproduce

```sh
node benchmark/bench-large-array.js
node benchmark/bench-compile.js
node benchmark/bench.js
# Optional machine-readable output and targeted reruns:
node benchmark/bench-large-array.js --json arrays.json
node benchmark/bench-large-array.js --kind nested-object --size 100000 --time 1000 --iterations 16
node benchmark/bench-compile.js --iterations 100 --json compile.json
```

The complete raw before/after runs and host metadata are under
[`results/bench-harness-profile/`](results/bench-harness-profile/).
The explicit before/after comparison, full-suite table, verdict and risks are in
[`bench-harness-profile.md`](bench-harness-profile.md).

<!-- generated tables -->

## Baseline array throughput

Each cell is median ops/sec (between-run CV %); these are the three **before** runs.

### 1,000 elements

| Kind | Default | json-stringify | Native |
| --- | ---: | ---: | ---: |
| integer | 98,357.43 (8.0%) | 100,000.00 (14.9%) | 169,004.56 (8.2%) |
| number | 19,138.76 (7.9%) | 19,753.09 (11.4%) | 41,096.45 (15.1%) |
| short-string | 36,309.50 (7.2%) | 37,037.04 (10.1%) | 66,480.52 (15.2%) |
| long-string | 5,956.81 (13.6%) | 5,893.19 (10.5%) | 6,928.42 (34.4%) |
| flat-object | 15,727.47 (5.4%) | 16,326.53 (6.8%) | 15,018.85 (12.3%) |
| nested-object | 4,611.84 (11.5%) | 4,745.90 (4.8%) | 4,924.07 (6.1%) |
| nullable-number | 24,792.98 (5.5%) | 24,767.80 (6.0%) | 40,404.04 (4.1%) |
| Float64Array | TypeError | TypeError | 15,594.54 (12.9%) |
| Int32Array | TypeError | TypeError | 26,845.64 (14.2%) |

### 20,000 elements

| Kind | Default | json-stringify | Native |
| --- | ---: | ---: | ---: |
| integer | 4,823.64 (15.7%) | 8,516.65 (14.2%) | 8,823.52 (14.4%) |
| number | 881.70 (10.0%) | 2,022.16 (15.6%) | 2,250.14 (13.4%) |
| short-string | 1,564.49 (8.3%) | 3,013.56 (4.9%) | 2,885.66 (4.9%) |
| long-string | 269.84 (11.7%) | 382.95 (11.4%) | 344.95 (52.8%) |
| flat-object | 604.90 (10.1%) | 634.42 (11.9%) | 616.11 (35.8%) |
| nested-object | 143.39 (54.0%) | 195.29 (33.3%) | 185.88 (21.2%) |
| nullable-number | 1,078.36 (13.6%) | 1,641.08 (17.0%) | 1,704.67 (13.6%) |
| Float64Array | TypeError | TypeError | 649.67 (17.8%) |
| Int32Array | TypeError | TypeError | 1,028.89 (15.8%) |

### 100,000 elements

| Kind | Default | json-stringify | Native |
| --- | ---: | ---: | ---: |
| integer | 774.41 (19.9%) | 1,663.95 (15.6%) | 1,602.08 (16.3%) |
| number | 133.82 (37.7%) | 397.75 (9.0%) | 393.65 (16.9%) |
| short-string | 258.54 (15.9%) | 549.02 (8.8%) | 579.19 (15.4%) |
| long-string | 37.89 (64.3%) | 63.98 (28.4%) | 68.20 (53.9%) |
| flat-object | 104.68 (69.7%) | 125.74 (48.3%) | 127.73 (18.0%) |
| nested-object | 15.68 (59.9%) | 43.88 (67.8%) | 44.58 (56.6%) |
| nullable-number | 215.38 (6.5%) | 304.85 (34.2%) | 323.10 (3.2%) |
| Float64Array | TypeError | TypeError | 134.92 (9.6%) |
| Int32Array | TypeError | TypeError | 216.96 (9.7%) |

### 1,000,000 elements

| Kind | Default | json-stringify | Native |
| --- | ---: | ---: | ---: |
| integer | 84.57 (11.6%) | 172.48 (10.5%) | 170.14 (10.7%) |
| number | 15.97 (10.5%) | 46.61 (13.8%) | 44.01 (16.2%) |
| short-string | 14.26 (8.3%) | 64.08 (13.9%) | 64.79 (10.2%) |
| long-string | 4.40 (11.7%) | 7.09 (33.6%) | 7.85 (39.1%) |
| flat-object | 3.87 (29.7%) | 14.72 (27.8%) | 14.32 (22.4%) |
| nested-object | 0.99 (22.3%) | 4.17 (50.7%) | 4.67 (53.6%) |
| nullable-number | 16.75 (60.7%) | 27.98 (44.1%) | 23.72 (26.8%) |
| Float64Array | TypeError | TypeError | 9.12 (31.6%) |
| Int32Array | TypeError | TypeError | 14.41 (51.0%) |

## Baseline build wall time

| Schema | Median ms | Builds/sec | Between-run CV % |
| --- | ---: | ---: | ---: |
| tiny | 0.0646 | 15,473.89 | 9.86 |
| wide | 0.3513 | 2,846.47 | 12.52 |
| deep | 0.1502 | 6,656.50 | 10.98 |
| refs | 0.5885 | 1,699.30 | 15.59 |
| array-of-objects | 0.0797 | 12,545.71 | 20.61 |
| oneOf-anyOf | 0.1774 | 5,637.12 | 7.24 |
| standalone | 0.3320 | 3,012.42 | 7.88 |

Sample variances in (ops/sec)² and ms², the three contributing values, and all before/after aggregates are in [`aggregate.json`](results/bench-harness-profile/aggregate.json).
