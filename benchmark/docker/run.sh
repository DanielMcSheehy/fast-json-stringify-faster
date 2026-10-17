#!/usr/bin/env bash
# Host launcher: builds the image and runs an isolated, CPU-pinned A/B benchmark.
# Usage: benchmark/docker/run.sh [results-dir]
# Env: BASE, HEAD, ROUNDS, SUITES, CPUSET (default 4-7), MEMORY (default 6g), LARGE_TIME, LARGE_ITER, NODE_VERSION (default 24), RUN_TESTS (1 to npm test both sides first)
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
REPO=$(cd "$HERE/../.." && pwd)
RESULTS=$(mkdir -p "${1:-$REPO/benchmark/docker/results}" && cd "${1:-$REPO/benchmark/docker/results}" && pwd)
CPUSET=${CPUSET:-4-7}
MEMORY=${MEMORY:-6g}
NODE_VERSION=${NODE_VERSION:-24}

docker build -q --build-arg NODE_VERSION="$NODE_VERSION" -t "fjs-bench:node$NODE_VERSION" "$HERE" >/dev/null
# The worktree's .git is a file pointing at the main repo; mount that too so refs resolve.
GITDIR=$(git -C "$REPO" rev-parse --git-common-dir)
GITDIR=$(cd "$REPO" && cd "$GITDIR" && pwd)
exec docker run --rm --init \
  --cpuset-cpus="$CPUSET" --memory="$MEMORY" --memory-swap="$MEMORY" \
  -v "$REPO:/repo:ro" -v "$GITDIR:$GITDIR:ro" -v "$RESULTS:/results" \
  -e BASE="${BASE:-origin/main}" -e HEAD="${HEAD:-HEAD}" -e ROUNDS="${ROUNDS:-3}" \
  -e SUITES="${SUITES:-large compile full}" -e LARGE_TIME="${LARGE_TIME:-300}" -e LARGE_ITER="${LARGE_ITER:-8}" -e RUN_TESTS="${RUN_TESTS:-0}" \
  "fjs-bench:node$NODE_VERSION"
