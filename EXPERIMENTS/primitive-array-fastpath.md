# exp/primitive-array-fastpath: fast path for arrays of primitive numbers/integers/booleans

Branch: `exp/primitive-array-fastpath` (from `feature/speedup` @ `d335e9c`)
Baseline: `feature/speedup` HEAD, measured in a detached worktree on the same machine/Node.
Node v24.19.0, darwin 25.6.0 arm64.

## Hypothesis

When the items schema is exactly `{type:'number'|'integer'|'boolean'}` (no nullable, no
const, no `$ref`, no anyOf/oneOf/allOf/if-then-else), the per-item path goes through
`buildValue -> buildSingleTypeSerializer -> serializer.asNumber/asInteger/asBoolean` for
every element. For 2e4..1e6 elements a specialized generated loop — specifically, a cheap
per-element guard loop followed by a whole-array native `JSON.stringify(obj)` — should be
much faster, provided the guard only admits element classes for which native output is
byte-identical to the current output.

## Step 1: exact semantics of asNumber / asInteger / asBoolean

A throwaway script compared the three serializer helpers against `JSON.stringify` for
every JS input class (run with `trunc` and `ceil` rounding; rounding only changes
non-integer `asInteger` inputs, which the guard excludes anyway).

| input class | asNumber | asInteger | asBoolean | JSON.stringify | native identical for |
| --- | --- | --- | --- | --- | --- |
| number (int-valued) | `42` | `42` | `true` | `42` | number+integer+boolean |
| number (fractional) | `1.5` | `1` (trunc) / `2` (ceil) | `true` | `1.5` | number, boolean |
| NaN | **throws** | **throws** | `false` | `null` | none (fjs throws) |
| ±Infinity | `null` | **throws** | `true` | `null` | number only |
| -0 | `0` | `0` | `false` | `0` | number+integer+boolean |
| 1e21, 1e-7, 5e-324 | ToString | `1e+21` / `0` | `true` | ToString | number; integer only for 1e21 |
| bigint | `10` | `10` (toString) | `true` | **throws** | none (native throws) |
| numeric string | `42` | `42` | `true` | `"42"` (quoted) | none |
| true / false | `1` / `0` | `1` / `0` | `true`/`false` | `true`/`false` | boolean only |
| null | `0` | `0` | `false` | `null` | none |
| undefined (also holes) | **throws** | **throws** | `false` | `null` | none (fjs throws) |
| object plain / with toJSON | **throws** | **throws** | `true` | `{...}` / toJSON result | none |
| object with valueOf | `42` | `42` | `true` | `{}` | none |
| Date | `0` | `0` | `true` | ISO string | none |

Conclusion — the guard conditions under which whole-array `JSON.stringify(arr)` is
byte-identical to the current per-item output:

- `{type:'number'}`: `typeof v === 'number' && v === v` (admits ±Infinity → `null` both ways; excludes NaN because fjs throws while native emits `null`)
- `{type:'integer'}`: `Number.isInteger(v)` (excludes fractional numbers whose output depends on the `rounding` option, and Infinity/NaN which throw)
- `{type:'boolean'}`: `typeof v === 'boolean'`

Notes:
- V8 renders finite doubles via the same EcmaScript ToString in both `'' + v` and
  `JSON.stringify`, so `-0`→`0`, `1e21`→`1e+21`, `5e-324` are identical.
- Holey arrays read as `undefined`, fail every guard, and fall back — the fallback then
  throws exactly like the baseline.
- Typed arrays (`Float64Array`, `Int32Array`): `Array.isArray` is false, so the existing
  `TypeError` fires before any fast path; unchanged (measured as `unsupported (TypeError)`).

## What was changed

`index.js` only (plus tests + benchmark files):

- New `getPrimitiveArrayFastPathCondition(itemsSchema)` (~30 lines): returns the guard
  condition string for plain `{type:'number'|'integer'|'boolean'}` item schemas, `null`
  otherwise. Bails out on tuple items (array schemas), `$ref`, `const`, `nullable`,
  `allOf`/`anyOf`/`oneOf`/`if` — every keyword that changes `buildValue` dispatch.
- In `buildArray()`'s standalone-function branch (the only reachable branch today: every
  schema carries a non-empty `schemaId`, so arrays are always emitted as `anonymousN`
  functions), before emitting the item loop, generate:

  ```js
  let fastNative_N = true
  for (let i = 0; i < arrayLength; i++) {
    const v = obj[i]
    if (!(<guard>)) { fastNative_N = false; break }
  }
  if (fastNative_N) return json + JSON.stringify(obj)
  // ...existing '[' + per-item loop + ']' path unchanged, used as fallback
  ```

- The fast path is skipped entirely when `largeArrayMechanism: 'json-stringify'` is
  selected (that opt-in already native-stringifies arrays ≥ `largeArraySize`).
- The legacy inlined branch of `buildArray()` is left untouched (unreachable; instrumenting
  it failed the 100%-coverage gate because it cannot be executed).
- Guard cost when the path misses: one extra typed read per element up to the first
  non-conforming index; then the classic loop reruns from index 0, preserving output and
  error messages/throw order exactly.

Tests: `test/primitive-array-fastpath.test.js` (13 tests: NaN, ±Infinity, -0, 1e21,
5e-324, MAX_SAFE_INTEGER, bigint, numeric strings, booleans-as-numbers, null, undefined
and holes, valueOf/toJSON objects, mixed guard-hit/miss, nested arrays in objects, sizes
1e3/2e4/1e5 byte-equality vs `JSON.stringify`, `largeArrayMechanism` opt-in, typed arrays
still `TypeError`, excluded schemas: nullable/type-array/anyOf/const). The file passes
**unmodified on baseline `feature/speedup` and on this branch** — output equality is
pinned, not assumed.

Benchmark files: adopted `benchmark/bench-large-array.js`, `bench-compile.js`,
`experiment-fixtures.js`, `experiment-utils.js` from `exp/bench-harness-profile` (they did
not exist on `feature/speedup`), adding a `boolean` fixture kind and a `--mechanism`
filter to `bench-large-array.js`.

## Results

### Targeted cases — median ops/sec of 3 runs, default mechanism

`node benchmark/bench-large-array.js --kind <kind> --mechanism default` (harness asserts
output equality before timing; each call includes `Buffer.byteLength`).

| kind | size | baseline | branch | delta | spread (3 runs) base/branch |
| --- | ---: | ---: | ---: | ---: | --- |
| integer | 1e3 | 131,874 | 210,526 | **+59.6%** | 2.2% / 5.5% |
| integer | 2e4 | 6,592 | 11,656 | **+76.8%** | 5.0% / 5.5% |
| integer | 1e5 | 1,149 | 2,197 | **+91.3%** | 3.0% / 7.0% |
| integer | 1e6 | 103 | 215 | **+108.9%** | 4.5% / 4.4% |
| number | 1e3 | 27,875 | 61,854 | **+121.9%** | 1.6% / 4.3% |
| number | 2e4 | 1,348 | 3,074 | **+128.1%** | 1.4% / 3.5% |
| number | 1e5 | 254 | 598 | **+135.6%** | 4.5% / 5.0% |
| number | 1e6 | 20 | 58 | **+186.5%** | 8.1% / 6.4% |
| boolean | 1e3 | 137,137 | 180,473 | **+31.6%** | 10.7% / 0.8% |
| boolean | 2e4 | 6,635 | 8,945 | **+34.8%** | 7.6% / 4.8% |
| boolean | 1e5 | 1,256 | 1,708 | **+36.1%** | 14.8% / 3.7% |
| boolean | 1e6 | 113 | 156 | **+38.5%** | 6.3% / 2.0% |

Context from the single full-matrix run: after the change the default mechanism is within
~2-5% of both the opt-in `largeArrayMechanism:'json-stringify'` and raw `JSON.stringify`
for these kinds (e.g. integer@1e5: default 2270 vs opt-in 2341 vs native 2372 ops/s) —
i.e. the fast path recovers essentially all of the native-array performance without the
opt-in's semantic trade-offs.

### Typed arrays

`Float64Array`/`Int32Array` remain `TypeError` on both sides (measured `unsupported
(TypeError)`); native serializes them as indexed objects, which fjs rejects — behavior
unchanged by this branch.

### Full `benchmark/bench.js` suite — median ops/sec of 3 runs

Targeted-relevant cases: *short array of numbers* 109,158 → 130,674 (**+19.7%**),
*short array of integers* 105,877 → 132,302 (**+25.0%**).

Non-targeted cases: -8.0% … +6.3% across the remaining 28 cases (e.g. *object with
integer property* -7.9%, *object with const null property* -8.0%, *const bool* +6.3%).
These cases' generated code is **byte-identical** to baseline (verified by diffing
`mode:'debug'` output for the flagged schemas), so the deltas are machine noise on
20-35M ops/s scalar micro-benchmarks, not effects of the change: per-run distributions
overlap (integer-property baseline {24.8M, 27.4M, 27.5M} vs branch {25.3M, 24.5M,
27.7M}), and typical run-to-run wobble on this box for those cases is ±10%. Array and
string cases with unchanged codegen sit within ±4%.

### Compile overhead

`node benchmark/bench-compile.js`: all 7 cases within noise (tiny 0.043 vs 0.045 ms,
wide 0.223 vs 0.228 ms, refs 0.338 vs 0.337 ms, …). The change adds one build-time
predicate call and a few emitted lines per qualifying array schema.

### Test suite

`npm test`: 600/600 pass (587 existing + 13 new), coverage gate 100% met, `npm run lint`
clean.

## Verdict

**Win — recommend merge.** Targeted cases improve +32% to +187% (>5% bar cleared at
every size, including the smallest 1e3), with byte-identical output and errors pinned by
tests that pass on both baseline and branch. No code-level regression is possible for
non-qualifying schemas (generated code identical), and observed suite deltas are noise.

## Risks

- **Double element read**: the guard reads each element, then `JSON.stringify` re-reads
  them. For arrays with index getters that are non-deterministic or side-effecting
  (exotic), the second read could observe different values or fire side effects twice.
  The existing opt-in `largeArrayMechanism:'json-stringify'` already has the same
  property at ≥2e4; here it applies at any length for plain primitive arrays.
- **Prototype-chain holes**: an index getter on `Array.prototype` for a missing index
  would be invoked twice (once by the guard, once by native). Both reads happen through
  the ordinary `obj[i]` path; only pathological prototypes notice.
- **Memory**: the fast path builds the array JSON as one native string; peak allocation
  for a 1e6-element numeric array is ~7-8 MB (same as the opt-in mechanism, and less
  churn than the per-item string concat it replaces).
- **V8 ToString reliance**: byte-equality of `'' + v` and native number rendering is an
  EcmaScript guarantee (both use Number::toString), not an implementation accident, but
  the pinned edge-case tests would catch any engine divergence.
- Follow-up candidates: extend to `{type:'string'}` items behind an `asString`-equivalent
  guard (harder: escaping parity), tuple schemas of primitive types, and
  nullable-primitive items (null renders identically in both paths).

## Reproducing

```sh
node benchmark/bench-large-array.js --kind integer --mechanism default   # per kind
node benchmark/bench-large-array.js                                     # full matrix
node benchmark/bench-compile.js
npm test
```

Raw JSON/log artifacts from the runs behind the tables above were produced with
`--json <file>`; medians computed across 3 invocations per side.
