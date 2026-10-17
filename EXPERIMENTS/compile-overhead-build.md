# Experiment: reduce `build()` compilation overhead

**Branch:** `exp/compile-overhead-build`  
**Baseline:** `feature/speedup` @ `d335e9c`  
**Node:** v24.19.0  
**Machine:** local Darwin (single machine, paired before/after)

## Hypothesis

`build()` cost is dominated by avoidable or cacheable work: Ajv `Validator` construction even when the schema never needs `validator.validate`, full-schema recursive-path walks even when there is no `$ref`, and (to a lesser extent) schema validation / ref-resolver setup. Skipping or deferring those should cut compile time for common schemas without changing generated serializer code or serialization semantics.

## Profile (baseline, before changes)

Harness: `node --cpu-prof --cpu-prof-interval=100 benchmark/profile-build.js all 300`  
Mixed workload: tiny / wide-200 / deep-20 / ref-heavy-50 / oneOf.

### Top 10 self-time (CPU profile hits)

| # | Hits | % | Symbol |
|---|------|---|--------|
| 1 | 372 | 13.9% | `build` @ `index.js:323` |
| 2 | 358 | 13.4% | `traverse` (detectRecursiveSchemas) @ `index.js` |
| 3 | 173 | 6.5% | garbage collector |
| 4 | 169 | 6.3% | `buildInnerObject` |
| 5 | 155 | 5.8% | `buildObject` |
| 6 | 117 | 4.4% | `validate10` @ `lib/schema-validator.js` |
| 7 | 103 | 3.9% | `_traverse` (json-schema-ref-resolver) |
| 8 | 92 | 3.4% | Ajv `addRule` |
| 9 | 86 | 3.2% | Ajv `resolve.js` |
| 10 | 85 | 3.2% | `assertObjectDepth` |

### Micro-isolation (tiny schema, 500 iters)

| Step | ms/op | Notes |
|------|------:|-------|
| `isValidSchema` (precompiled schema-validator) | 0.0009 | Already a module singleton; **not** a per-build Ajv |
| `new RefResolver` + `addSchema` | 0.0004 | Cheap |
| `new Validator()` | **0.038** | Dominates tiny `build()` |
| `new Function` (trivial) | 0.0005 | Small |
| full `fjs(tiny)` (baseline) | ~0.041–0.065 | ≈ Validator cost |

**Keyword check:** runtime Ajv validation is only wired for `anyOf` / `oneOf` / `if`+`then`/`else` (`buildOneOf`, `buildIfThenElse`). `not` is walked for depth/recursion but does **not** populate `validatorSchemasIds`. Debug mode still requires a real `Validator` instance (tests assert `instanceof Validator` / `ajv instanceof Ajv`).

## Change

Files: `index.js`, `test/schema-depth.test.js`; added `benchmark/bench-compile.js` (+ profile helpers).

1. **Lazy `Validator`:** construct Ajv/`Validator` only when `context.validatorSchemasIds.size > 0` or `options.mode === 'debug'`. Otherwise pass `null` (standalone already emitted `validator = null` for empty validator sets). Does **not** share validators across `build()` calls — options (`ajv`, rounding/largeArray on the serializer/context) stay per-build (#899 scoping preserved).
2. **Skip `detectRecursiveSchemas` when the schema tree has no `$ref`:** `assertObjectDepth` now returns `hasRef`; without `$ref`, json-pointer paths cannot cycle in the recursive-path walk, so the third full traversal is skipped.
3. **Coverage:** extend the dependencies depth test so recursive detection still walks boolean schemas / dependency schema forms when `$ref` is present; drop redundant `|| ''` fallbacks on `Location` fields inside `traverse`.

**Not changed:** generated serializer code shape; `lib/schema-validator.js` (already cached); public options; `package.json` version. Ref-resolver still runs (cheap; still needed for `$ref` / merged schemas). Schema meta-validation still runs every build.

## Before / after — `build()` wall time

Method: median of **300** iterations per case after warmup; baseline measured with `index.js` stashed to `feature/speedup` HEAD on the same process sequence. Ops/sec = `1000 / median_ms`.

| Case | Before median ms | After median ms | Before ops/sec | After ops/sec | Δ ops/sec |
|------|-----------------:|----------------:|---------------:|--------------:|----------:|
| tiny | 0.0651 | 0.0115 | 15,370 | 87,272 | **+468%** |
| wide-200 | 0.3422 | 0.1825 | 2,922 | 5,478 | **+87.5%** |
| deep-20 | 0.1163 | 0.0600 | 8,598 | 16,673 | **+93.9%** |
| ref-heavy-50 | 0.4747 | 0.4601 | 2,107 | 2,174 | +3.2% |
| oneOf | 0.1375* | 0.1355* | 7,273 | 7,380 | ~+1.5% |

\*oneOf: median of three alternating base/after 400-iter medians (Ajv still required; skip-recursive helps little). Within run-to-run noise.

Also added `benchmark/bench-compile.js` (100-iter table printer) for repeatable local runs.

## Before / after — full `benchmark/bench.js` (serialization)

Single paired run each (baseline stashed vs after). Suite RME is often ±5–20%, so treat as smoke that codegen is unchanged rather than a precise ±2% gate.

| Outcome | Count (of 29 named cases) |
|---------|---------------------------:|
| within ±2% | 10 |
| after faster >2% | 12 |
| after slower >2% | 7 |

Notable: `oneOf external refs compile and first stringify` improved (~752 → 1203 ops/sec) because that case includes compile cost. Pure serialize cases move within noise (e.g. short string −5%, integer −17% on this single pair — both have large RME on the after run). **No generated-code-shape changes**; `npm test` green including standalone-mode and side-effect tests.

## Verdict

**merge**

Clear wins on the targeted compile cases that do not need Ajv (`tiny` / `wide` / `deep` ≫ 5%). `ref-heavy` and `oneOf` are flat-to-slightly-better (Ajv / recursive walk still required). Serialization path unchanged by construction; tests define semantics.

## Risks / follow-ups

- Debug mode still pays full `new Validator()` (API/tests require it).
- Schemas that only use `not` still skip Ajv (pre-existing); no behavior change.
- Further wins likely need codegen/traversal fusion (`assertSchemaDepth` + object walk) or cheaper Ajv bootstrap when unions are present — separate hypotheses.
- Do not cache a populated `Validator` across `build()` calls: schema IDs and `options.ajv` differ per call.

## Validation

- `npm test` (c8 100% + tstyche) — pass  
- `eslint` on touched files — pass  
- Branch pushed to `mine` (`exp/compile-overhead-build`)
