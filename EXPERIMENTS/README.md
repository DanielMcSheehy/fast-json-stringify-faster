# fast-json-stringify speedup experiments

Challenge: improve **large-array serialization** and/or **compilation (`build()`) overhead**
while preserving every existing semantic (output bytes, thrown errors, option handling).

Fork: https://github.com/DanielMcSheehy/fast-json-stringify-faster (remote `mine`).
Integration branch: `feature/speedup`. Each experiment lives on `exp/<name>` branched from it.

## Ground rules (every worker)

1. `npm test` (tap + lint) MUST stay green. Semantics are defined by the existing test suite plus
   `JSON.stringify`-equivalence where the README promises it. If a change alters output for any
   input, it is rejected.
2. Benchmark with `node benchmark/bench-large-array.js` (array sizes 1e3 / 2e4 / 1e5 / 1e6;
   item kinds: integer, number, short string, long string, flat object, nested object) and
   `node benchmark/bench-compile.js` (build() time for small / wide / deep / $ref-heavy schemas).
   If those files do not exist yet in your worktree, create them under `benchmark/` using
   `tinybench` (already a devDependency) following `benchmark/bench.js` conventions, and report
   that you created them. Run each bench at least 3 times; report median ops/sec and variance.
3. Compare against baseline = `feature/speedup` HEAD (`git stash`/`git worktree` or
   `benchmark/bench-cmp-branch.js`). Report both numbers, same machine, same Node (v24).
4. Write `EXPERIMENTS/<name>.md` with: hypothesis, what was changed (files/functions), before/after
   table, whether it is a win (>5% on the targeted case and no regression >2% elsewhere in
   `benchmark/bench.js`), risks, and recommendation (merge / reject / needs follow-up).
5. Commit on your branch with a descriptive message; push with `git push mine HEAD` (remote
   `mine` = the fork; add it with
   `git remote add mine git@github.com:DanielMcSheehy/fast-json-stringify-faster.git` if missing).
6. Do not touch `package.json` versions or publish. Do not change public option names.
7. Keep changes minimal and reviewable; one hypothesis per branch. Negative results are valuable:
   report them with numbers.

## Key code locations

- `index.js` `build()` (~L323): context setup, ajv validator, `new Function` compile.
- `index.js` `buildArray()` (~L846): array code generation; `largeArrayMechanism`
  (`default` | `json-stringify`), `largeArraySize` (default 2e4).
- `index.js` `buildObject()` (~L796), `buildValue()` (~L1503).
- `lib/serializer.js`: `asString`, `asNumber`, `asInteger`, etc. (runtime helpers).
- `lib/validator.js`, `lib/schema-validator.js`: ajv wiring (compile-time cost).
- `benchmark/bench.js`, `bench-thread.js`, `bench-cmp-branch.js`: existing harness.
