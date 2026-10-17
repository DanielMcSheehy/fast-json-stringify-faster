# Experiment: large-array mechanism heuristic

**Branch:** `exp/large-array-mechanism-heuristic`  
**Baseline:** `feature/speedup` @ `d335e9c`  
**Node:** v24.19.0  
**Machine:** local Darwin (same host for all numbers below)

## Hypothesis

`largeArrayMechanism: 'json-stringify'` only helps when native `JSON.stringify`
beats generated code, which depends on item kind and size. The fixed default
threshold `2e4` and opt-in flag leave speed on the table. If for some item
schemas (e.g. all-required primitive objects, plain strings) native output is
provably byte-identical, a per-schema automatic mechanism could be chosen at
compile time.

## What changed

| File | Change |
| --- | --- |
| `benchmark/bench-large-array.js` | Created (contract harness: sizes 1e3/2e4/1e5/1e6 × item kinds × mechanisms) |
| `benchmark/bench-compile.js` | Created (build() compile overhead cases) |
| `benchmark/crossover-large-array.js` | Created (size sweep + crossover detection) |
| `benchmark/diff-fuzz-large-array.js` | Created (differential fuzz + mismatch classes) |
| `benchmark/bench-large-array-medians.js` | Created (3-trial median reporter for tables) |
| `README.md` | Corrected outdated `Array.join` claim; documented crossovers, semantic risks, typed-array behavior, recommended thresholds |
| `test/largeArrayMechanism.semantics.test.js` | Locks in key default vs `json-stringify` divergences + typed-array rejection |
| `index.js` | **No behavioral change** — auto/default threshold change rejected as unsafe |

## Semantic findings (mismatch classes)

Differential probes + 200 random arrays per schema (`benchmark/diff-fuzz-large-array.js`).

| Class | Meaning | Example |
| --- | --- | --- |
| `mechanism-throw-divergence` | default throws, `json-stringify` succeeds (or vice versa) | `undefined` / `NaN` in integer/number arrays: default throws; native path emits `null` |
| `mechanism-output-divergence` | both succeed, different bytes | `null` in non-nullable integer → default `[1,0]`, json-stringify `[1,null]`; string `"2"` coerced to `2`; extra props kept by native; schema property order vs insertion order; `toJSON` honored by native only |
| `fjs-vs-native-output` / `fjs-vs-native-throw` | same as above vs bare `JSON.stringify` | mirrors mechanism divergence when threshold is 1 |
| `json-stringify-mech-vs-native` | rare when both succeed | should match for plain JSON data |

**Typed arrays:** `Array.isArray(Float64Array|Int32Array) === false`. Both mechanisms throw
`TypeError: The value of '#' does not match schema definition.` Native
`JSON.stringify(new Float64Array([1,2,3]))` yields `{"0":1,"1":2,"2":3}`.

**Conclusion:** there is **no** item schema for which `JSON.stringify(array)` is
byte-identical to fjs **for all JS inputs**. Even “simple” integer/string arrays
diverge on `undefined`, `NaN`, coercion, and objects with `toJSON`. Auto-enabling
`json-stringify` at compile time would change outputs/errors → violates the
zero-semantic-change rule.

## Crossover table (native vs default)

First measured size where native median ops/sec > default (from
`crossover-large-array.js`; sizes 1e2…1e6). “Stable win region” is where
`json-stringify` / native clearly beat default on the contract sizes.

| Item kind | First native > default | At n=2e4, prefer | Notes |
| --- | --- | --- | --- |
| integer | ≤100 | native / json-stringify (~1.6×) | Native early |
| number | ≤100 | native / json-stringify (~1.9×) | Native early |
| short string | ≤100 | json-stringify (~1.8×) | Native early |
| long string | noise at 100; default often wins mid-range | **default** | Escaping cost dominates; native not a clear win until very large |
| flat object | ≤100 then default wins mid | slight json-stringify | Default wins ~5e2–5e3; native pulls ahead ≥1e4–1e5 |
| nested object | ~5e4 | **default** (~1.5×) | Default wins until ~50k |
| nullable integer | ≤100 then mixed | **default** often | Noisy; default competitive at large n |
| nullable string | ≤100 | json-stringify | Similar to short string |

### Targeted median ops/sec (3 trials)

From `benchmark/bench-large-array-medians.js` (ops/sec, median of 3).

| Kind | n | default | json-stringify (size=1) | native |
| --- | ---: | ---: | ---: | ---: |
| integer | 1e3 | 117037 | 149405 | 156530 |
| integer | 2e4 | 4660 | 7345 | 7372 |
| integer | 1e5 | 886 | 1659 | 1845 |
| integer | 1e6 | 134 | 155 | 146 |
| number | 1e3 | 21680 | 45657 | 44663 |
| number | 2e4 | 1067 | 1995 | 1862 |
| number | 1e5 | 220 | 415 | 362 |
| number | 1e6 | 15 | 40 | 41 |
| short string | 1e3 | 42202 | 70410 | 69961 |
| short string | 2e4 | 1757 | 3489 | 3256 |
| short string | 1e5 | 391 | 696 | 706 |
| long string | 1e3 | 4463 | 4276 | 3734 |
| long string | 2e4 | 212 | 203 | 200 |
| long string | 1e5 | 43 | 40 | 39 |
| flat object | 1e3 | 22700 | 17719 | 17848 |
| flat object | 2e4 | 773 | 872 | 873 |
| flat object | 1e5 | 76 | 191 | 186 |
| nested object | 1e3 | 27037 | 14139 | 14479 |
| nested object | 2e4 | 1061 | 663 | 709 |
| nested object | 1e5 | 78 | 142 | 148 |

(1e6 skipped for string/object kinds to avoid memory pressure.)

## Full `benchmark/bench.js` suite (median of 3 runs)

No `index.js` serializer change → before ≡ after (noise only). Medians of three
`--expose-gc` runs on this branch:

| Benchmark | median ops/sec |
| --- | ---: |
| short string | 21061534 |
| unsafe short string | 21972810 |
| short string with double quote | 15426912 |
| long string without double quotes | 57928 |
| unsafe long string without double quotes | 191388 |
| long string | 48132 |
| unsafe long string | 183831 |
| number | 25493894 |
| integer | 26047994 |
| formatted date-time | 2615445 |
| formatted date | 2326465 |
| formatted time | 2317882 |
| short array of numbers | 91506 |
| short array of integers | 89927 |
| short array of short strings | 34497 |
| short array of long strings | 33393 |
| short array of objects with properties of different types | 16280 |
| object with number property | 24044540 |
| object with integer property | 24097653 |
| object with short string property | 18941789 |
| object with long string property | 45264 |
| object with properties of different types | 3208779 |
| simple object | 10537191 |
| simple object with required fields | 9487935 |
| oneOf external refs compile and first stringify | 1032 |
| object with const string property | 22271499 |
| object with const number property | 24552423 |
| object with const bool property | 22395244 |
| object with const object property | 22128803 |
| object with const null property | 23396634 |

## Compile bench (`benchmark/bench-compile.js`)

| Case | ops/sec (single run) |
| --- | ---: |
| small schema | 23934 |
| wide schema (50 props) | 12022 |
| deep schema (depth 20) | 10688 |
| $ref-heavy schema | 18362 |
| large array schema (integer items) | 28859 |

## Risks

- Auto `json-stringify` would silently drop coercion/validation and change bytes
  for invalid-but-common inputs (`undefined`, `NaN`, extra props).
- Lowering global default `largeArraySize` only affects opted-in users but still
  changes which lengths skip validation; wrong for nested objects if set too low.
- README previously claimed `Array.join` for the default large-array path; current
  `buildArray()` uses generated concatenation loops (claim corrected).

## Verdict: **reject** (with follow-up)

Reject compile-time automatic mechanism selection and reject changing the default
`largeArraySize` / default mechanism. Hypothesis that a safe per-schema auto
exists is **false** under the zero-semantic-change constraint.

**Follow-up (optional, separate branch):**
1. Documented opt-in recipe only (partially done in README) — done here.
2. Optional `largeArrayMechanism: 'json-stringify'` + per-call `largeArraySize`
   guidance in docs / examples (no API change).
3. Speed up the **default** array loop (different hypothesis: accumulation /
   codegen) so users need not opt into native stringify.

## Recommendation

Do **not** merge behavior changes to `largeArrayMechanism`. Merge is fine for
docs + benches + semantics tests as an informative experiment; treat serializer
auto-heuristic as rejected.
