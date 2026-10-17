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

Harness: `node benchmark/profile-build-parts.js`.

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

## Ref-heavy regression fix

The integrated five-round container comparison in [container-results.md](container-results.md)
superseded the original host measurements: `refs` regressed **7.3%** and the full
suite's `oneOf external refs compile and first stringify` regressed **7.0%**.
This follow-up compares `origin/main` (`5f69709`) with the integrated branch before
the fix (`1400b47`) and the traversal fix (`0d56f6b`).

### Reproduction and profile

Created `/tmp/fjs-main` with `git worktree add /tmp/fjs-main origin/main`, installed
dependencies, and copied the canonical `bench-compile.js`, `experiment-fixtures.js`,
and `experiment-utils.js` into it. Host Node was v24.19.0; both sides used Ajv
8.20.0, json-schema-ref-resolver 3.0.0, fast-uri 4.2.1, and tinybench 6.2.1.
Three alternating `node benchmark/bench-compile.js --case refs` runs gave median
throughputs of **2,865.15 → 2,815.25 ops/s (-1.7%)** before the fix. The host did
not reproduce the container regression's magnitude, so the isolated comparison
below remains the performance gate.

Profiled each revision with:

```sh
node --cpu-prof --cpu-prof-interval=100 --cpu-prof-dir=<profile-directory> \
  benchmark/bench-compile.js --case refs --iterations 10000
```

Worker-thread profile self-sample counts (the main thread mostly waits):

| Function | origin/main | Integrated before fix | Fixed |
| --- | ---: | ---: | ---: |
| `assertObjectDepth` | 1,402 | 3,015 | 1,327 |
| `Location.getPropertyLocation` | 2,286 | 2,119 | 180 |
| recursive-schema `traverse` | 10,212 | 8,341 | 7,997 |
| `build` | 3,122 | 4,892 | 3,382 |
| `buildInnerObject` | 2,059 | 2,605 | 2,681 |
| Total worker samples | 30,059 | 34,425 | 23,867 |

These samples include startup/warmup and are diagnostic, not throughput estimates;
JIT inlining can also move samples between functions. The integrated depth scan
spends more time processing properties, while pointer escaping and recursive
traversal remain substantial costs. The `$ref` scan was already folded into the
depth walk, not a separate traversal. Ajv is still constructed at the same point
in `build()` and is absent altogether for the `refs` fixture; neither duplicate
Ajv construction nor a second schema clone explains this regression. The profile
also shows the integrated object code generation costs more than main, so it does
not isolate the entire regression to lazy Validator creation.

### Fix and semantics

- `assertObjectDepth` reads each child once, detects `$ref` from that value, and
  only allocates traversal entries for non-null objects. Primitive entries were
  previously allocated and then immediately discarded. Object depths, circular
  object detection, and the `$ref` recursion decision retain their checks.
- `Location.getPropertyLocation` tests for `~` or `/` before escaping. Ordinary
  property names and numeric tuple indexes avoid two string replacements;
  names that require JSON-pointer escaping retain the same replacement order.

Lazy Validator creation, recursion detection, `lib/validator.js`, and generated
serializer code are unchanged. No validators or mutable schemas are shared
between builds. Raw profiles and host measurements are in `/tmp/fjs-ref-profiles`.

### Isolated compile comparison

Ran only the requested compile suite, with three alternating rounds, Node
v24.22.0 on linux/arm64, CPUs 4–7, and the existing 6 GiB container limit:

```sh
ROUNDS=3 SUITES=compile benchmark/docker/run.sh /tmp/fjs-docker-refs
node benchmark/docker/compare.js /tmp/fjs-docker-refs
```

`base=5f69709bed95604c8a403cd217186b528cb2fdd9`
`head=0d56f6bccc63ea6cbbf355fa0c70e3e1f954c419`

| Case | base ops/s | head ops/s | Change | CV base / head |
| --- | ---: | ---: | ---: | ---: |
| tiny | 19456.96 | 193554.63 |  894.8% | 16.9% / 1.0% |
| wide | 3782.51 | 6606.11 |   74.6% | 1.6% / 2.3% |
| deep | 8476.05 | 17057.57 |  101.2% | 0.3% / 2.5% |
| refs | 2334.41 | 2840.57 |   21.7% | 1.8% / 1.1% |
| array-of-objects | 15810.15 | 61538.46 |  289.2% | 1.9% / 2.2% |
| oneOf-anyOf | 8022.72 | 8303.06 |    3.5% | 0.4% / 1.5% |
| standalone | 3834.47 | 6912.47 |   80.3% | 2.2% / 1.3% |

All requested thresholds pass: refs and unions exceed -2%, and every other case
exceeds +70%. The tiny baseline has high variation, but even its fastest round is
well below the fixed branch. These results supersede the earlier compile table;
the full three-suite container run remains a coordinator follow-up.

Separately ran just `oneOf external refs compile and first stringify` from
`benchmark/bench.js` through its unchanged `bench-thread.js` worker on the host,
three alternating pairs. Base throughput was 1,957 / 1,806 / 1,846 ops/s; fixed
throughput was 2,029 / 2,028 / 1,837 ops/s. Median throughput improved
**1,846 → 2,028 ops/s (+9.9%)**. This narrower host check passes, but does not
replace the coordinator's isolated full-suite verification.

Validation: `npm test` passes **652 tests**, **100% statements/branches/functions/
lines**, and **15 TypeScript assertions**; `npm run lint` passes. Existing tests
cover escaped property names, recursive references, maximum depth, boolean
schemas, tuple items, standalone output, and validator options. Recommendation:
**merge the fix**, retaining the lazy-validator and no-ref traversal wins.
