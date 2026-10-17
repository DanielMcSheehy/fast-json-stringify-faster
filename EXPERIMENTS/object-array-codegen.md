# object-array-codegen

**Verdict: merge.** Folding `{` / `,` into property-key literals and returning `json + '}'` from named object serializers is byte-identical and faster on arrays of objects. Named per-item functions already existed; a single-expression required-object builder was not implemented (string values are not compile-time constants).

Node v24.19.0, machine-local, baseline = `feature/speedup` @ `d335e9c`. Primary comparison is a same-process A/B (old module vs this branch, alternating order, 5 tinybench runs, median). Sequential full-suite runs are reported too but are noisier (machine contention).

## Hypothesis

For `items: { type: 'object', properties: {...} }`, generated per-item code does many `json += '"key":'` appends plus `obj.key !== undefined` checks. Concatenating constant key prefixes into single literals, building a per-item string in one expression when every property is `required` and `additionalProperties` is absent, and/or emitting a named per-item function could cut time for 2e4..1e6 element arrays. Large generated functions might also be refused by V8 (`function too large`).

## What the generated code already did

Debug dumps (`fjs(schema, { mode: 'debug' })`) of the benchmark schemas showed:

- Object items already compile to a **named** function (`anonymous1`) because `schemaId !== ''` (root schema id is always assigned). The array loop is `json += anonymous1(value)`. A new named-function extraction was not needed.
- Optional properties already fold the comma into the key (`",\"n\":"` vs `"\"n\":"`) but still emit a separate `json += '{'`.
- Required properties emit the comma and the key as **two** appends (`json += JSON_STR_COMMA` then `json += "\"n\":"`).
- Item functions are small (a few dozen statements). `--trace-opt` shows `anonymous0` / `anonymous1` reach TurboFan. No `function too large` bailout. `anonymous0` does deopt once on `Insufficient type feedback for binary operation` (the `json +=` / `json +` concat) before stabilizing; that is pre-existing string-append feedback, not size.

## Change

`index.js` `buildInnerObject()` only (called from `buildObject()`). `lib/serializer.js` untouched.

1. **Required-first properties:** the object-open brace and subsequent commas are folded into the key literal (`"{\"s\":"`, `",\"n\":"`). Default-value branches fold the same prefix plus the JSON literal.
2. **Optional properties:** `{` is folded into whichever property emits first (`addComma ? ",\"k\":" : ((addComma = true), "{\"k\":")`). A bare `{` is emitted only when nothing else was. Single-property objects (no comma flag) fold `{` into the key or the default literal, with an else branch that emits `{` when the property is absent.
3. **Named object functions** (`isReturnForm`): `return json + JSON_STR_END_OBJECT` instead of append-then-return. Inlined objects still append `}`.

Not done: one expression for an all-required object. String properties still call `asString` (escaping), so the value is not a constant and `json += lit + call()` is the slower shape the existing fold-literals work already rejected. `additionalProperties` / `patternProperties` loops are unchanged.

### Before (required `{s,n,b}` item, feature/speedup)

```js
json += JSON_STR_BEGIN_OBJECT
const value_s_1 = obj["s"]
if (value_s_1 !== undefined) {
  json += "\"s\":"
  json += asString(value_s_1)
} else {
  throw new Error('"s" is required!')
}
const value_n_2 = obj["n"]
if (value_n_2 !== undefined) {
  json += JSON_STR_COMMA
  json += "\"n\":"
  json += asNumber(value_n_2)
} else {
  throw new Error('"n" is required!')
}
// ... same for "b" ...
json += JSON_STR_END_OBJECT
return json
```

### After

```js
const value_s_1 = obj["s"]
if (value_s_1 !== undefined) {
  json += "{\"s\":"
  json += asString(value_s_1)
} else {
  throw new Error('"s" is required!')
}
const value_n_2 = obj["n"]
if (value_n_2 !== undefined) {
  json += ",\"n\":"
  json += asNumber(value_n_2)
} else {
  throw new Error('"n" is required!')
}
// ... same for "b" ...
return json + JSON_STR_END_OBJECT
```

## Benchmarks

Created `benchmark/bench-large-array.js` and `benchmark/bench-compile.js` (they were not in the worktree). Large-array harness: tinybench, sizes 1e3 / 2e4 / 1e5 / 1e6, kinds integer / number / short string / long string / flat object / flat object required / nested object. `Buffer.byteLength` is included, matching `benchmark/bench.js`.

### Targeted cases — same-process A/B (median ops/sec, 5 runs)

| case | n | before | after | delta |
| --- | ---: | ---: | ---: | ---: |
| flat object `{s,n,b}` optional | 1e3 | 13,628 | 14,371 | **+5.5%** |
| flat object | 2e4 | 545 | 591 | **+8.4%** |
| flat object | 1e5 | 48.0 | 107.4 | **+124%** |
| flat object | 1e6 | 2.74 | 2.91 | **+6.1%** |
| flat object required | 1e3 | 13,213 | 14,603 | **+10.5%** |
| flat object required | 2e4 | 491 | 544 | **+10.8%** |
| flat object required | 1e5 | 47.3 | 89.9 | **+90%** |
| flat object required | 1e6 | 3.01 | 3.78 | **+25.7%** |
| nested object | 1e3 | 14,282 | 15,975 | **+11.9%** |
| nested object | 2e4 | 604 | 675 | **+11.8%** |
| nested object | 1e5 | 64.5 | 118.9 | **+84%** |
| nested object | 1e6 | 4.33 | 4.70 | **+8.6%** |
| single required object (sanity) | 1 | 9.07e6 | 1.03e7 | **+13.6%** |

1e5 deltas are larger than the other sizes and likely include GC/allocator effects (output is ~2.5MB / ~6.5MB). Direction is consistent with 2e4 and 1e6. 1e6 flat-object samples included one cold ~0.5 ops/sec outlier on the baseline; median still favors the change.

### Primitive arrays (should be unchanged; A/B, 3 runs)

| case | n | before | after | delta |
| --- | ---: | ---: | ---: | ---: |
| integer | 1e3 | 100,137 | 97,844 | −2.3% |
| integer | 2e4 | 3,312 | 3,431 | +3.6% |
| number | 1e3 | 20,781 | 20,351 | −2.1% |
| number | 2e4 | 960 | 1,014 | +5.6% |
| short string | 1e3 | 30,792 | 29,901 | −2.9% |
| short string | 2e4 | 1,536 | 1,627 | +5.9% |

Within noise of the threshold (±2%). Generated primitive-array code is not touched.

### Sequential `benchmark/bench.js` (3 tinybench samples each, not interleaved)

Run separately (baseline first, then the change) under load, so treat deltas under ~5% as noise. Object cases that this change actually rewrites:

| bench | before | after | delta |
| --- | ---: | ---: | ---: |
| short array of objects with properties of different types | 16,762 | 14,851 | −11.4% |
| object with number property | 24,017,144 | 23,091,738 | −3.9% |
| object with integer property | 24,298,117 | 23,364,323 | −3.8% |
| object with short string property | 18,680,687 | 17,309,878 | −7.3% |
| object with long string property | 43,602 | 41,552 | −4.7% |
| object with properties of different types | 3,117,404 | 3,078,604 | −1.2% |
| simple object | 10,085,909 | 9,201,809 | −8.8% |
| simple object with required fields | 9,906,306 | 9,583,788 | −3.3% |

The same run shows primitive benches moving the same way (short string −16%, number −20%, short array of numbers −19%) with relative margins of error up to ±23%. That is machine drift, not a codegen regression: the interleaved A/B above is the comparison that holds the two implementations in one process. The short-array-of-objects case is the same schema as "flat object n=1e3", which the A/B measured at **+5.5%**.

### Compile (`benchmark/bench-compile.js`, median ops/sec, 3 runs)

| schema | after (this branch) | before (small/wide only) |
| --- | ---: | ---: |
| small | 22,013 | 25,291 |
| wide (40 props) | 11,721 | 12,687 |
| deep (12) | 14,312 | — |
| $ref-heavy | 16,319 | — |

Compile was not the target. The small/wide drop is in the same noisy sequential window as the full suite; codegen still emits one statement per property.

## Semantics

`npm test` green (587 unit tests, 100% c8 on `index.js` and `lib/`, tstyche 15/15). `npm run lint` (neostandard) clean. Direct byte compare of this branch vs `feature/speedup` `index.js` across optional/required objects, defaults, `additionalProperties`, `patternProperties`, nested objects, nullable, and arrays: 47/47 equal (output or thrown message).

## Risks

- Empty-object and single-optional-property shapes now depend on the comma flag / else branch to emit `{`. Covered by existing tests and the byte compare, but easy to break if someone reorders property emission.
- `return json + '}'` allocates the closing concat in the named function instead of an append. A/B says this is a win; do not "fix" it back to two statements without remeasuring.
- 1e5 speedups look outsized next to 2e4 / 1e6. Re-bench on a quiet machine before quoting those percentages outside this report.

## Recommendation

**Merge** into `feature/speedup`. Win is >5% on the targeted object-array cases (2e4 through 1e6, required and optional, flat and nested) in an interleaved A/B, with no semantic change. Follow-up, separate hypothesis: array-level string accumulation (`anonymous0` still deopts on `json += anonymous1(value)`), not more object-literal folding.
