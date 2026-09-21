#!/usr/bin/env bash
#
# verify-dist-bundle.sh
#
# Verify that the built MCP server bundle (packages/mcp-server/dist/index.mjs)
# leaves every runtime dependency as an external import. Inlining one would
# duplicate code the user's install already provides and defeat version pinning.
#
# No third-party package is inlined: dist/index.mjs takes in only this
# repository's own source (shared/src/*) and data (data/champions/*.json).
# Every npm package it uses is declared as a runtime dependency in
# packages/mcp-server/package.json and must stay external.
#
# This script fails (exit 1) if the invariant is violated.
#
# Intended to be invoked from CI (GitHub Actions) as well as locally.

set -euo pipefail

readonly REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
readonly DIST_FILE="${REPO_ROOT}/packages/mcp-server/dist/index.mjs"

# publish 物の dependencies に宣言され、dist では import として残るべきパッケージ。
# inline されてしまうと利用者環境で重複したコードを抱え、版の固定も効かなくなる。
readonly EXTERNAL_PACKAGES=(
  "@smogon/calc"
  "@modelcontextprotocol/sdk"
  "@pokesol/pokesol-text-parser-ts"
  "zod"
)

if [[ ! -f "${DIST_FILE}" ]]; then
  echo "::error::dist bundle not found: ${DIST_FILE}" >&2
  echo "::error::run 'npm run build' before invoking this script" >&2
  exit 1
fi

violations=0

for pkg in "${EXTERNAL_PACKAGES[@]}"; do
  pattern_static="from[[:space:]]+[\"'\`]${pkg}(/[^\"'\`]*)?[\"'\`]"

  if ! grep -E -n "${pattern_static}" "${DIST_FILE}" >/dev/null 2>&1; then
    echo "::error::${pkg} is a runtime dependency but does not appear as an import in ${DIST_FILE}" >&2
    echo "::error::it was likely inlined; check that it is declared in packages/mcp-server/package.json dependencies" >&2
    violations=1
  fi
done

if [[ "${violations}" -ne 0 ]]; then
  exit 1
fi

echo "OK: ${DIST_FILE} keeps every runtime dependency as an external import"
exit 0
