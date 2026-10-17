# String-array fast path

Hypothesis: for an items schema that is exactly `{ type: 'string' }` (no format, no nullable, no const, no combinator), the per-element `asString` scan dominates arrays from `2e4` to `1e6` elements. A guarded whole-array `JSON.stringify` should beat it when every element is a string, and it can be selected automatically because that case is provably the same bytes as the existing loop. A tighter generated `asString` + join loop was the other candidate.

Verdict: **merge**. All-string arrays at or above `largeArraySize` (default `2e4`) are faster in every interleaved round. Output is unchanged. `benchmark/bench.js` does not exercise this path (its string arrays have length `1e3`).

## Change

- `lib/serializer.js` `Serializer.asPlainStringArray`. One pass copies elements into a new array. If any element is not `typeof 'string'`, it returns `undefined`. Otherwise it returns `JSON.stringify(copy)`. The copy is what keeps a single getter read and skips the source array's `toJSON`, which is what the per-element loop already does. `asString` itself is unchanged.
- `index.js` `isPlainStringItemsSchema` and `buildArray`. When `largeArrayMechanism` is not already `'json-stringify'` and the items schema is a plain string, arrays with `length >= largeArraySize` try `asPlainStringArray` first. A miss falls through to the existing coercing loop. Both the function-wrapper path and the empty-schema-id inline path emit this. `serializerFns` destructures the new helper. Number, integer, and object codegen are untouched.
- Not fast-pathed: `format` (including `'unsafe'` and `'date-time'`), `nullable: true`, `const`, `allOf` / `anyOf` / `oneOf` / `if`, tuple `items`, and the opt-in `largeArrayMechanism: 'json-stringify'` path (still an unguarded `JSON.stringify` of the original array). A `$ref` is resolved first, so a ref to exactly `{ type: 'string' }` does take the fast path and a ref to `{ type: 'string', format: 'unsafe' }` does not.
- Rejected: building the JSON with a parts array of `asString` results and `join`. On an idle machine that loop was slower than the existing serializer, and much slower once strings contained quotes (`1e6` quoted: 2.9 ops/sec vs 5.4 for the old loop vs 13.5 for the guarded copy). It was not shipped.
- Harnesses added because they were not in the tree: `benchmark/bench-large-array.js`, `benchmark/bench-compile.js`, and `benchmark/bench-string-array.js`. `package.json` version is still `7.1.0`.

## Equivalence

Throwaway script, Node v24.19.0. `asString(x)` compared with `JSON.stringify(x)`, then `build({ type: 'array', items: { type: 'string' } })([x])` compared with `JSON.stringify([x])`. Length-1 arrays stay on the old loop (`largeArraySize` is `2e4`). The fast path is only taken when the direct string comparison is SAME, so the array of strings matches too.

`asString` on a string primitive matched `JSON.stringify` for every class tried: empty, quotes, backslashes, trailing slash, controls (`\n\r\t\b\f\u0000\u001f`), lone high and low surrogates, a paired surrogate, U+2028/U+2029, lengths 41, 42, 4999, 5000, an 8000-char plain string, and quoted strings of about 4k and 6k. String primitives also ignore `String.prototype.toJSON` on both sides. A boxed string matches `JSON.stringify` when passed to `asString` directly.

Direct `asString` is not the array-element path. Non-strings only reach `asString` after the array loop coerces them. Where a direct call happens to match `JSON.stringify`, that is because a missing `.length` falls through to `JSON.stringify` inside `asString`. The array loop does not do that.

| input | `asString(x)` vs `JSON.stringify(x)` | array of one item, `{type:'string'}` vs `JSON.stringify([x])` |
| --- | --- | --- |
| any string class above | SAME | SAME (`["hello \" \\ world"]`) |
| number `42` / `1.5` / `NaN` / `Infinity` | SAME (NaN and Infinity become `null`) | DIFF: `["42"]`, `["1.5"]` vs `[42]`, `[1.5]` |
| `true` / `false` | SAME | DIFF: `["true"]` / `["false"]` vs `[true]` / `[false]` |
| `null` | asString throws TypeError | DIFF: `[""]` vs `[null]` (nullable items emit `null` before this loop) |
| `undefined` | asString throws TypeError | fjs throws TypeError on `.toString()`; JSON is `[null]` |
| bigint `10n` | both throw on a direct `JSON.stringify` | DIFF: fjs `["10"]`; JSON throws |
| valid Date | SAME quoted ISO | SAME |
| invalid Date | both `null` | fjs throws RangeError; JSON is `[null]` |
| RegExp `/a"b/` | both `{}` | DIFF: fjs `["a\\"b"]` (quoted source); JSON `[{}]` |
| plain object `{a:1}` | SAME | DIFF: fjs `["[object Object]"]` |
| object with `toJSON` and `toString` | both use `toJSON` | DIFF: fjs uses `toString` (`from-toString`); JSON uses `toJSON` |
| object with only `toString` | SAME `{}` | DIFF: fjs `["only-toString"]`; JSON `[{}]` |
| boxed string | SAME | SAME (`typeof` is `'object'`, so the fast path misses and the slow path runs) |
| symbol | both `undefined` (printer labeled only one side) | DIFF: fjs `["Symbol(s)"]`; JSON `[null]` |
| nested array `['x']` | asString throws (`charCodeAt`) | DIFF: fjs `["x"]` via `toString`; JSON `[["x"]]` |
| array's own `toJSON` | n/a | fjs ignores it and writes the elements; JSON calls it. The fast path copies first so it ignores it too |
| sparse hole | n/a | fjs throws TypeError; JSON writes `null` |

Because of those array-element differences, the fast path cannot call `JSON.stringify` on the original array. The type guard is the semantic boundary.

## Benchmarks

Node v24.19.0, macOS, this worktree. Baseline is `feature/speedup` at `d335e9c` (the parent of this branch), loaded from a second copy of the same tree with `index.js` and `lib/serializer.js` restored to that commit. Each harness ran three times, old and new alternating. The table value is the median of the three runs. Ops/sec is tinybench's throughput mean. Variance is that run's latency RME, and the spread across the three runs is called out where it matters.

Other experiment workers were running `benchmark/bench.js` on this machine during the session. Absolute ops/sec moved by tens of percent between an early idle prototype and later runs, including untouched `JSON.stringify`. Interleaved medians are the comparison. The idle prototype is cited only for the rejected join loop and for a quiet guard-only sample.

tinybench's sequential `iterations` option is a minimum, not a cap. The harnesses set `iterations: 0` and a short time budget (`250–1500` ms depending on size) so a `1e6` case cannot run for a full minute. Each task calls `Buffer.byteLength` on the output so a rope is flattened.

The quoted element in the array harnesses is 64 characters (`'hello "world" \\ path / '` plus 40 `x`s), not 10k. An array of `1e6` ten-kilobyte strings is multi-gigabyte. A single 10k quoted string is in the paired run below and does not move.

### Official large-array harness

`node --expose-gc benchmark/bench-large-array.js`. Default `largeArraySize` `2e4`, default mechanism. Median ops/sec of 3 interleaved runs. Median within-run RME is about 1% at `n=1000` and 2–7% at `n=1e6`.

| case | old | new | delta |
| --- | ---: | ---: | ---: |
| short-string n=1000 | 49,867 | 47,718 | -4.3% |
| quoted-string n=1000 | 11,893 | 11,853 | -0.3% |
| short-string n=20000 | 2,188 | 3,524 | +61.1% |
| quoted-string n=20000 | 514 | 987 | +92.0% |
| short-string n=100000 | 381 | 711 | +86.6% |
| quoted-string n=100000 | 91 | 197 | +116.5% |
| short-string n=1000000 | 16 | 69 | +331% |
| quoted-string n=1000000 | 7 | 19 | +171% |

`n=1000` is below the threshold, so the new branch is a compare that fails. The -4.3% on short strings is one slow first pair (paired deltas -13%, +8%, -2.7%). Every individual pair at `n>=20000`, both string kinds, was a win. The smallest of those 18 pair deltas was +53% (short strings, `n=20000`, round 1) and the quoted `n=20000` pairs were +89%, +86%, +96%.

Non-string kinds in the same harness do not call `asPlainStringArray`. Their medians moved with load, not with this diff: integer `n=1e6` stayed 18, number `n=1e6` stayed 21, flat and nested objects at `n=1e6` stayed 7. At `n=20000`, integer went 3,687 → 4,286 and number 1,023 → 1,188 while nested objects went 1,086 → 1,043. Those swings are the same order as the run-to-run spread on the old build.

### Mixed arrays and the json-stringify mechanism

Not in `bench-large-array.js`. An interleaved runner (3 rounds, old and new called on the same arrays, sample order rotated) measured short `'hello'`, the 64-char quoted string, mixed with a number every 10th index, and mixed with a single number at the last index. The third column is the new build with `largeArrayMechanism: 'json-stringify'` and `largeArraySize: 2e4`. That column is faster on mixed data because it skips coercion. It is not a fair speed target: `["a", 1]` stays a number there, and the default path quotes it as `"1"`.

Median ops/sec of the three rounds:

| case | old default | new fast path | json-stringify mechanism | fast path vs old |
| --- | ---: | ---: | ---: | ---: |
| short n=1000 | 21,090 | 22,120 | 21,661 | +4.9% |
| quoted n=1000 | 5,521 | 5,794 | 5,733 | +4.9% |
| mixed-every-10 n=1000 | 13,817 | 15,707 | 15,707 | +13.7% |
| mixed-tail n=1000 | 21,525 | 19,802 | 20,513 | -8.0% |
| short n=20000 | 1,036 | 1,496 | 1,820 | +44.3% |
| quoted n=20000 | 205 | 355 | 479 | +73.5% |
| mixed-every-10 n=20000 | 978 | 842 | 1,754 | -13.9% |
| mixed-tail n=20000 | 1,091 | 849 | 1,804 | -22.2% |
| short n=100000 | 102 | 215 | 118 | +111% |
| quoted n=100000 | 16 | 24 | 39 | +51.5% |
| mixed-every-10 n=100000 | 59 | 56 | 291 | -5.6% |
| mixed-tail n=100000 | 147 | 88 | 260 | -40.4% |
| short n=1000000 | 2.2 | 8.8 | 12.6 | +306% |
| quoted n=1000000 | 0.8 | 2.0 | 2.3 | +136% |
| mixed-every-10 n=1000000 | 2.7 | 2.9 | 10.6 | +7.9% |
| mixed-tail n=1000000 | 2.5 | 2.2 | 9.4 | -14.6% |

All-string rows at `n>=20000` won in every round (short `n=20000` pair deltas +50%, +39%, +42%; quoted +51%, +41%, +125%). Standard deviations at `n=1e5` and `n=1e6` are often larger than the sample, so the exact percent at those sizes is soft and the direction is not. The guarded copy lands near the unguarded mechanism on pure string arrays and behind it by the cost of the copy (`1e6` short: 8.8 vs 12.6 ops/sec).

Mixed-tail is the miss path: the helper copies every element, sees the final number, returns `undefined`, and the coercing loop runs. At `n=20000` and `n=100000` every round was slower. At `n=1e6` the sign flipped across rounds (+6%, +7%, -43%) with standard deviations of tens to hundreds of milliseconds. Mixed-every-10 aborts the copy at the first number, so the wasted work is smaller and the delta is noise. `n=1000` never calls the helper.

Same runner, controls that should not move: one 10k quoted string 102,124 → 102,135 ops/sec; an array of 1000 numbers 36,308 → 34,681 (pair deltas -3.8%, +0.3%, -15.3%). A single short string read 4.8e6 → 6.0e6 on two of three rounds and 0% on the first. That is timer granularity, not the array path.

`benchmark/bench-string-array.js` is the repeatable tinybench form of these cases (default, json-stringify mechanism, and a typeof-only guard). The numbers above are from the interleaved runner so old and new share a process schedule. The harness file measures the new build only.

### Guard cost at 1e6

A typeof scan of `1e6` short strings, no copy and no stringify, at the end of the paired run: median 3.086 ms, 324 ops/sec. On the earlier idle prototype the same scan was 0.709 ms (1,411 ops/sec). The loaded 3 ms is a few percent of the new `1e6` short-string fast path (about 114 ms/op at 8.8 ops/sec in that same run, and 14 ms/op at 69 ops/sec in the large-array harness) and well under the old loop (about 450 ms/op at 2.2 ops/sec in the paired run, 62 ms/op at 16 ops/sec in the harness). The expensive miss is the discarded copy plus the fallback loop, not the typeof scan.

### Full `benchmark/bench.js`

Three interleaved runs. Length of every array in this file is `1e3`, below `largeArraySize`, so the fast path does not run. "Short array of long strings" is the same input as "short array of short strings" in the existing file (both use `shortArrayOfShortStrings`). Within-run RME on these microbenchmarks is about 0.1–0.6%. The spread across the three old runs is much larger. Delta is median-new vs median-old.

| case | old median | new median | delta | spread of the 3 old runs |
| --- | ---: | ---: | ---: | ---: |
| short string | 22,918,072 | 22,765,624 | -0.7% | 7.0% |
| unsafe short string | 23,571,130 | 23,432,255 | -0.6% | 4.8% |
| short string with double quote | 18,186,947 | 18,229,618 | +0.2% | 18.2% |
| long string without double quotes | 64,235 | 63,830 | -0.6% | 7.2% |
| unsafe long string without double quotes | 225,192 | 221,990 | -1.4% | 9.5% |
| long string | 55,823 | 54,965 | -1.5% | 15.5% |
| unsafe long string | 223,981 | 220,064 | -1.7% | 9.0% |
| number | 33,653,479 | 32,243,581 | -4.2% | 24.0% |
| integer | 35,224,092 | 34,394,149 | -2.4% | 13.0% |
| formatted date-time | 2,958,026 | 2,923,255 | -1.2% | 6.9% |
| formatted date | 2,673,526 | 2,684,019 | +0.4% | 9.3% |
| formatted time | 2,643,886 | 2,673,204 | +1.1% | 9.9% |
| short array of numbers | 98,481 | 108,932 | +10.6% | 10.7% |
| short array of integers | 103,087 | 107,277 | +4.1% | 8.2% |
| short array of short strings | 36,696 | 38,294 | +4.4% | 15.7% |
| short array of long strings | 37,568 | 38,949 | +3.7% | 9.0% |
| short array of mixed objects | 17,828 | 17,833 | +0.0% | 9.3% |
| object with number property | 24,189,539 | 24,193,525 | +0.0% | 1.5% |
| object with integer property | 26,921,991 | 24,285,383 | -9.8% | 11.9% |
| object with short string property | 21,221,384 | 21,097,340 | -0.6% | 10.6% |
| object with long string property | 52,377 | 52,609 | +0.4% | 11.0% |
| object with mixed properties | 3,706,590 | 3,666,048 | -1.1% | 9.7% |
| simple object | 11,635,958 | 11,733,812 | +0.8% | 10.0% |
| simple object with required fields | 11,440,105 | 11,460,182 | +0.2% | 10.9% |
| oneOf external refs compile and first stringify | 2,017 | 2,049 | +1.6% | 25.3% |
| object with const string property | 23,898,317 | 23,808,396 | -0.4% | 1.8% |
| object with const number property | 30,569,472 | 33,692,110 | +10.2% | 10.7% |
| object with const bool property | 24,830,912 | 28,217,563 | +13.6% | 7.8% |
| object with const object property | 23,820,049 | 23,831,826 | +0.0% | 1.8% |
| object with const null property | 27,224,260 | 26,054,765 | -4.3% | 7.7% |

Four cells are below -2%: number, integer, object-with-integer, const null. None of those schemas emit `asPlainStringArray`. The integer-object case was +0.3% on round 1 and -8.8% / -11.3% on rounds 2 and 3, while the number-object case in the same processes went the other way (+1%, +16%, 0%). That is CPU-level movement between tasks, not a change in the integer serializer. The string-array rows in this file, which are the nearest neighbors of the edit and still take the old loop, are +4.4% and +3.7%, inside the old runs' own spread.

### Compile

`node benchmark/bench-compile.js`, three interleaved runs, time budget 400 ms. Median ops/sec and median RME:

| schema | old | new | delta | old RME | new RME |
| --- | ---: | ---: | ---: | ---: | ---: |
| small | 8,282 | 9,437 | +13.9% | 31% | 30% |
| wide (80 props) | 2,265 | 2,555 | +12.8% | 30% | 47% |
| deep (40) | 2,115 | 2,266 | +7.1% | 29% | 34% |
| ref-heavy (30 external schemas) | 1,769 | 1,815 | +2.6% | 45% | 32% |

RME is 20–50% and the three runs overlap (new small was 9,437 / 6,219 / 9,787 against old 8,596 / 8,282 / 7,594). No compile change is visible. The extra source is a few lines inside `buildArray`.

## Tests

`test/string-array-fastpath.test.js` locks the differences above: string classes and a seeded fuzz over the `asString` length buckets, non-strings returning `undefined` from `asPlainStringArray`, a spy proving the helper stringifies a copy and not the original (so `toJSON` is skipped and a getter runs once), below-threshold arrays not taking the native path, coercion and thrown errors for undefined and invalid Date, and debug output that does not contain the call `asPlainStringArray(` for numbers, unsafe, nullable, const, combinators, date-time, the json-stringify mechanism, or an unsafe `$ref`. Plain string items, an inline empty-schema-id location, and a `$ref` to `{ type: 'string' }` do contain the call. Nested arrays and an object property are checked so an inner string array can fast-path while a mixed inner array still quotes numbers.

`npm test` on this branch: 599 unit tests passed, c8 100% statements/branches/functions/lines on `index.js` and `lib`, tstyche 15 assertions passed. `npm run lint` (eslint, neostandard) passed.

## Recommendation

Merge. The targeted case clears the 5% bar by a wide margin (about +60% to +90% at `2e4`, about +90% to +120% at `1e5`, about +170% to +330% at `1e6` on the official harness) and the bytes match the old loop for every input the tests cover. The 2% `bench.js` readings that point down are on number and integer schemas this diff does not compile, and they sit inside the baseline's run-to-run spread.

Follow-up, not a blocker: a caller that declares `{ type: 'string' }` items and then passes non-strings near the end of a large array pays a full copy before the old loop. A scan that allocates only after every element is a string would make that miss cheaper and would read each getter twice on the hit path, which is a behavior change relative to today's single read. Worth a separate branch if mixed data on a string schema shows up in a profile.

## Risks

- The fast path is correct only while `asString(string) === JSON.stringify(string)`. That held on Node 24 for the classes above. A future `asString` change that diverges has to keep this helper in lockstep, or stop emitting it.
- Getters on the array run once. `JSON.stringify(original)` would run them again and would honor an array `toJSON`. Both would change output. The copy is the fix, and it is the cost on the miss path.
- `format: 'unsafe'` must stay excluded. It does not escape.
- `nullable: true` string items emit JSON `null` for null, which a blanket stringify-of-strings would turn into `""` only if null failed the guard and fell through. Nullable is excluded so the existing nullable wrapper stays in charge. Non-nullable null still becomes `""`.
- `const` is excluded. The const serializer writes the schema constant, not the value.
- The opt-in `largeArrayMechanism: 'json-stringify'` is unchanged and still not equivalent on non-strings, on array `toJSON`, or on sparse holes.
- `new Array(len)` assumes `len` is a real array length. A real array's length is. The helper is only called after `Array.isArray`.
- `largeArraySize: 0` is still ignored (falsy), so the default stays `2e4`. Pre-existing. Not part of this change.
- Benchmark noise on this machine is large enough that a single median under -2% on an untouched `bench.js` row is not evidence of a regression. The string-array rows at `n>=2e4` are the signal, and they agreed across rounds and across two harnesses.
