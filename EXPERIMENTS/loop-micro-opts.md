# Experiment: loop-micro-opts

**Branch:** `exp/loop-micro-opts`  
**Base:** `feature/speedup` (`d335e9c`)  
**Node:** v24.19.0  
**Date:** 2026-10-16  
**Verdict:** **reject**

## Hypothesis

The generated homogeneous-array loop peels element 0 and duplicates the per-item code (`buildValue` body appears twice). That increases bytecode and may hurt TurboFan inlining of the per-item serializer. A single loop with an explicit separator (`if (i !== 0) json += ','`, `let sep = ''` / `sep = ','`, or the existing tuple-style `addComma` flag) should be equal or faster, and smaller generated code may let V8 inline more aggressively. Separately, the top-level generated function may hit V8 inlining/optimization limits on large object-array cases.

## What changed (during measurement)

Temporary `FJS_LOOP_VARIANT` env switch in `index.js` `buildArray()` homogeneous-array templates (named-function path ~L939–951 and inlined path ~L1022–1034). Four shapes:

| Variant | Shape |
|---------|--------|
| `peel` (baseline) | serialize `obj[0]`, then `for (i = 1; …)` with leading comma |
| `if-i` | single `for (i = 0; …)` with `if (i !== 0) json += ','` |
| `sep` | `let sep = ''`; each iter `json += sep; sep = ','` |
| `addComma` | `!addComma && (addComma = true) \|\| (json += ',')` |

Also added contract harnesses (missing on base): `benchmark/bench-large-array.js`, `benchmark/bench-compile.js`, plus helper runners under `benchmark/` used for this experiment.

**Final `index.js`:** switch removed; loop templates identical to `feature/speedup` (no permanent codegen change).

## Variant table — median ops/sec (3 runs)

Targeted cases: integer / short-string / flat-object × sizes 1e3 / 2e4 / 1e5 / 1e6.  
Harness: `benchmark/bench-large-array.js` via `benchmark/bench-loop-variants.js`, `largeArrayMechanism: 'default'`, tinybench ~500ms. Raw samples: `EXPERIMENTS/loop-variant-raw.json`.

Δ% is vs `peel` median.

| Case | peel | if-i | Δ% | sep | Δ% | addComma | Δ% |
|-----------:|-----:|---:|----:|---:|---------:|---:|
| integer@1e3 | 104052 | 102539 | −1.5 | 99934 | −4.0 | 105768 | +1.7 |
| integer@2e4 | 4192 | 3905 | −6.9 | 4001 | −4.6 | 4067 | −3.0 |
| integer@1e5 | 538 | 528 | −1.9 | 487 | −9.5 | 536 | −0.4 |
| integer@1e6 | 17.5 | 18.5 | +5.7 | 18.2 | +3.9 | 17.9 | +2.0 |
| short-string@1e3 | 33293 | 32465 | −2.5 | 33688 | +1.2 | 31809 | −4.5 |
| short-string@2e4 | 1606 | 1573 | −2.1 | 1554 | −3.2 | 1492 | −7.1 |
| short-string@1e5 | 294 | 271 | −7.8 | 290 | −1.6 | 285 | −3.3 |
| short-string@1e6 | 12.9 | 12.7 | −1.6 | 12.3 | −5.1 | 12.5 | −3.1 |
| flat-object@1e3 | 18069 | 19048 | +5.4 | 17853 | −1.2 | 16255 | −10.0 |
| flat-object@2e4 | 766 | 773 | +1.0 | 744 | −2.8 | 649 | −15.2 |
| flat-object@1e5 | 119 | 123 | +3.4 | 104 | −12.3 | 98 | −17.6 |
| flat-object@1e6 | 4.2 | 4.2 | −1.1 | 4.4 | +3.2 | 4.0 | −5.5 |

**Win bar (>5% on target, no >2% regression elsewhere):** no variant clears it. Isolated +5% spikes (`if-i` on flat-object@1e3 / integer@1e6) are offset by regressions ≥2–8% on other sizes/kinds. `sep` and `addComma` are mostly flat-to-worse.

## Full `benchmark/bench.js` suite

Because the permanent change is a no-op vs `feature/speedup`, before ≡ after. Medians over 3 runs on the same machine/Node (ops/sec):

| Benchmark | median ops/sec |
|-----------|---------------:|
| short string | 17,429,693 |
| unsafe short string | 19,643,038 |
| short string with double quote | 12,775,641 |
| long string without double quotes | 50,866 |
| unsafe long string without double quotes | 157,446 |
| long string | 43,047 |
| unsafe long string | 160,911 |
| number | 24,332,904 |
| integer | 25,914,704 |
| formatted date-time | 2,321,991 |
| formatted date | 1,973,576 |
| formatted time | 1,978,556 |
| short array of numbers | 74,637 |
| short array of integers | 80,697 |
| short array of short strings | 32,531 |
| short array of long strings | 32,189 |
| short array of objects with properties of different types | 15,602 |
| object with number property | 23,669,745 |
| object with integer property | 23,427,105 |
| object with short string property | 15,481,257 |
| object with long string property | 37,881 |
| object with properties of different types | 2,798,058 |
| simple object | 8,701,053 |
| simple object with required fields | 8,525,068 |
| oneOf external refs compile and first stringify | 846 |
| object with const string property | 20,678,883 |
| object with const number property | 23,748,301 |
| object with const bool property | 23,597,064 |
| object with const object property | 20,586,320 |
| object with const null property | 22,709,551 |

Raw runs: `EXPERIMENTS/bench-suite-run{1,2,3}.txt`, summary `EXPERIMENTS/bench-suite-summary.json`.

## V8 deopt / inlining findings (1e5 flat-object array)

Command (Node 24; traces go to stdout):

```bash
FJS_LOOP_VARIANT=<variant> node --trace-opt --trace-deopt --trace-turbo-inlining --trace-file-names \
  benchmark/trace-loop-v8.js
```

Artifacts: `EXPERIMENTS/v8-traces/{peel,if-i,sep,addComma}.full.txt` and `codegen-*.js.txt`.

Findings:

1. **No “function too large” / “inlining budget” / “Disabled optimization” messages** on any variant for this schema.
2. Generated top-level `anonymous0` and item `anonymous1` both tier up to **MAGLEV** then **TURBOFAN_JS** (including OSR) for every variant.
3. **`anonymous1` (object item) bytecode size = 309** in all variants — peel does **not** duplicate the object body; `buildValue` emits a call into the shared object serializer, so peel only duplicates a small call/load sequence in the array wrapper.
4. Generated source sizes (chars): peel 2824, if-i 2749 (−2.7%), sep 2751, addComma 2777 — savings are tiny.
5. TurboFan **successfully inlines** `anonymous1`, `asString`, `asNumber`, `asBoolean` into `anonymous0` for all variants.
6. Dominant deopt on `anonymous0` across variants: **“Insufficient type feedback for binary operation”** (string `+=`), plus normal OSR / allocation-site noise. Counts are similar (~20–22 deopt log lines); not unique to peel.

Conclusion on the V8 half of the hypothesis: the peel template is not hitting inlining limits here, and single-loop shapes do not materially change optimization behavior.

## Risks

- Changing separator style without a measured win risks micro-regressions (see `addComma` / `sep` object numbers) for no semantic benefit.
- Run-to-run variance on large sizes (esp. 1e6) is high; decisions require multi-run medians, not single shots.

## Recommendation

**Reject.** Keep the existing first-element peel. Negative result with numbers: loop-shape micro-opts do not deliver a consistent >5% win, and V8 evidence shows peel is already eligible for full optimization/inlining on the 1e5 object-array case.

## Acceptance checklist

- [x] `EXPERIMENTS/loop-micro-opts.md` with variant table, deopt/inlining findings, verdict
- [x] `npm test` green (587 pass, 100% coverage after switch removal)
- [x] Branch `exp/loop-micro-opts` pushed to `mine`
- [x] Zero permanent semantic/output changes (`index.js` == `feature/speedup` for array loops)
