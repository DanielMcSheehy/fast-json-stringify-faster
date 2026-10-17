#!/usr/bin/env bash
# Runs inside the container. Expects:
#   /repo     read-only bind mount of the git repo (any worktree)
#   /results  writable bind mount for JSON output
# Env: BASE (git ref), HEAD (git ref), ROUNDS, SUITES (space-separated: large compile full), LARGE_TIME, LARGE_ITER
set -euo pipefail
BASE=${BASE:-origin/main}
HEAD=${HEAD:-HEAD}
ROUNDS=${ROUNDS:-3}
SUITES=${SUITES:-"large compile full"}
LARGE_TIME=${LARGE_TIME:-300}
LARGE_ITER=${LARGE_ITER:-8}

echo "node $(node -v) cpus=$(nproc) BASE=$BASE HEAD=$HEAD ROUNDS=$ROUNDS SUITES=$SUITES"

git clone -q /repo /work/src
cd /work/src
# /repo is a worktree; its refs live in the main repo. Resolve both refs there before cloning loses them.
BASE_SHA=$(git -C /repo rev-parse "$BASE")
HEAD_SHA=$(git -C /repo rev-parse "$HEAD")
git fetch -q /repo "$BASE_SHA" "$HEAD_SHA"

for side in base head; do
  sha=$([ "$side" = base ] && echo "$BASE_SHA" || echo "$HEAD_SHA")
  git worktree add -q "/work/$side" "$sha"
  (cd "/work/$side" && npm install --no-audit --no-fund --silent)
done
# Canonical harness + fixtures come from HEAD so both sides measure identical workloads.
for f in bench-large-array.js bench-compile.js experiment-fixtures.js experiment-utils.js; do
  cp "/work/head/benchmark/$f" "/work/base/benchmark/$f"
done
echo "base=$BASE_SHA head=$HEAD_SHA" | tee /results/refs.txt

run_suite () { # suite side round
  local suite=$1 side=$2 round=$3 out="/results/$suite-$side-$round"
  case $suite in
    large)   node benchmark/bench-large-array.js --time "$LARGE_TIME" --iterations "$LARGE_ITER" --json "$out.json" > "$out.txt" ;;
    compile) node benchmark/bench-compile.js --json "$out.json" > "$out.txt" ;;
    full)    node benchmark/bench.js > "$out.txt" ;;
  esac
}

for round in $(seq 1 "$ROUNDS"); do
  # Alternate side order per round to cancel thermal/boost drift.
  if (( round % 2 )); then order="base head"; else order="head base"; fi
  for suite in $SUITES; do
    for side in $order; do
      echo "[round $round] $suite $side $(date -u +%H:%M:%S)"
      (cd "/work/$side" && run_suite "$suite" "$side" "$round")
    done
  done
done
echo done
