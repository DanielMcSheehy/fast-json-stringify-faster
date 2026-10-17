# Experiment: serializer runtime helpers

**Branch:** `exp/serializer-helpers` (from `feature/speedup`)
**Node:** v24.19.0
**Verdict:** **needs follow-up** (do not merge as a large-array win)

## Hypothesis

Per-element helpers in `lib/serializer.js` are the hot path for large primitive arrays.
`asString` manually scans strings shorter than 42 and uses a regex pre-test
(`/[\u0000-\u001f\u0022\u005c\ud800-\udfff]/`) for `42 <= length < 5000`. A regex
pre-test on short strings, a different scan threshold, or `JSON.stringify` for
`length >= 42` might be faster. `asNumber` / `asInteger` might benefit from
`typeof` ordering and `String(n)` instead of `'' + n`.

## What changed

`lib/serializer.js` `asString` only. The `< 42` char scan is unchanged. For
`length >= 42` the function now calls `JSON.stringify(str)` directly and drops
the `STR_ESCAPE` pre-test (and the 5000 cutoff).

`asNumber`, `asInteger`, `asBoolean`, `asDateTime`, `asDate`, `asTime`,
`asUnsafeString` are unchanged. `index.js` is unchanged.

### Variants measured and rejected

| Variant | Result |
|---|---|
| Regex pre-test for `len < 42` (clean → quote, else `JSON.stringify`) | Slower than the scan on short clean and quoted strings (about −5% to −20%). |
| Always regex below 5000 | Same: loses the scan's quote/backslash escape path. |
| Scan threshold 20 or 100 | No consistent win over 42. |
| `asNumber` typeof-first | First short bench looked faster; a longer paired bench regressed the numeric hot path (about −38% on integers). Rejected. |
| `asNumber` `String(n)` | Faster on integers, slower on floats (`'' + n` wins). Rejected. |
| `asInteger` `String(n)` | +17% on a single `asInteger(42)`, **−40%** when concatenating 20k integers into one string. Rejected. |
| `asBoolean` ternary vs `&&` | Ternary slightly slower. Rejected. |

Identity: `EXPERIMENTS/identity-asString.js` checks every code unit `0..0xFFFF`,
sampled surrogate pairs, and mixed lengths. Optimized `asString` matches the
baseline clone and `JSON.stringify` on all 65,839 strings. `npm test`: 587 pass,
100% coverage, eslint clean.

## Per-helper microbench (tinybench, paired in one process)

Median of the single paired run (800ms / 200ms warmup), ops/sec:

| helper input | baseline | optimized | delta |
|---|---:|---:|---:|
| `asString` 11-char clean | 20,683,527 | 19,929,274 | −3.6% |
| `asString` 200-char clean | 3,532,038 | 4,392,867 | **+24.4%** |
| `asString` 200-char with quotes | 3,909,480 | 4,527,777 | **+15.8%** |
| `asInteger(42)` | 17,332,446 | 17,650,888 | +1.8% (noise; implementation identical) |

Earlier isolated sweeps (not paired) that motivated the change:

- `len=100` clean: `JSON.stringify` 14.6M vs baseline regex path 11.6M (**+26%**).
- `len=100` quoted: `JSON.stringify` 13.8M vs baseline 6.4M (**+114%**). The regex matches, then `JSON.stringify` runs anyway.
- `len=1000` clean: +76%; `len=1000` quoted: +158%.
- `len=5` clean/quoted: scan stays within ~2% of the best variant; regex is slower.
- `len=10000` clean: all variants within ~5% (already `JSON.stringify` past 5000).

## Large-array bench (interleaved, same process, 3 rounds)

Harness: `benchmark/bench-large-array.js` (created for this experiment; sizes
1e3 / 2e4 / 1e5 / 1e6; kinds integer, number, short string, long string, flat
object, nested object). Long strings are 200 chars with a quote every 50 chars.
`SKIP_HUGE_OBJECTS=1` skips 1e6 long-string / object cases (too slow to be stable).

The first sequential before/after suite mixed in a rejected `asInteger` `String(n)`
change and showed machine drift of tens of percent even on integer cases that
do not call `asString`. Those numbers are in `EXPERIMENTS/results/baseline-large*.txt`
and `after-large*.txt` and are **not** the decision table.

Decision table: interleaved baseline vs optimized in one process (median of 3), ops/sec:

| case | baseline | optimized | delta |
|---|---:|---:|---:|
| integer n=20000 | 3,084 | 3,300 | +7.0% |
| short string n=20000 (`hello world`, len 11) | 1,191 | 1,273 | +6.9% |
| long string n=20000 | 233 | 252 | +8.2% |
| long string n=1000 | 4,818 | 4,932 | +2.4% |

The long-string case clears the 5% bar at n=20000 and not at n=1000. Integer
moved the same amount with no code change, so the array-level deltas are inside
run-to-run noise. The helper microbench is the reliable signal.

## Full `benchmark/bench.js` (3 runs each, median ops/sec)

Sequential runs drifted hard: baseline run 3 and all three after runs sat ~40%
below baseline runs 1–2 on cases that do not touch the changed path (unsafe
short string, integer, number). That table is therefore not evidence of a
regression. Interleaved string cases in one process (median of 3):

| case | baseline | optimized | delta |
|---|---:|---:|---:|
| short string | 15,247,031 | 14,718,717 | −3.5% |
| long string clean (len 10000) | 52,163 | 50,088 | −4.0% |
| long string quoted (len ~10100) | 40,660 | 40,347 | −0.8% |
| object with long string | 38,514 | 37,900 | −1.6% |
| array of 1000 short strings | 29,148 | 28,399 | −2.5% |

`benchmark/bench-compile.js` (one run, not the hypothesis; created for the contract):

| schema | baseline | optimized | delta |
|---|---:|---:|---:|
| small | 18,948 | 19,508 | +3.0% |
| wide | 9,534 | 9,999 | +4.9% |
| deep | 13,647 | 13,107 | −4.0% |
| refHeavy | 13,848 | 14,047 | +1.4% |

## Risks

- Output bytes are identical to the previous `asString` and to `JSON.stringify`
  on the exhaustive identity script. Surrogate and control characters still go
  through `JSON.stringify` (short strings via the scan bailout, longer strings
  always).
- The regex fast path for clean strings of length 42–4999 is gone. Microbenches
  say `JSON.stringify` is faster there on Node 24; this may not hold on older V8.
- Array-level speedup is not proven. A merge would be a micro-optimization for
  medium strings, not a large-array mechanism change.

## Recommendation

**needs follow-up.** Keep the `asString` change only if a follow-up re-runs
`benchmark/bench.js` and `benchmark/bench-large-array.js` interleaved (or
`bench-cmp-branch.js`) on a quiet machine and shows no case worse than −2%
with the medium-string microbench still up. Do not merge on the current
array-level numbers. Do not adopt `String(n)` or typeof-first for `asNumber` /
`asInteger`.
