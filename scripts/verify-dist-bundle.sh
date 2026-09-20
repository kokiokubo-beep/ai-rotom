#!/usr/bin/env bash
#
# verify-dist-bundle.sh
#
# Verify that the built MCP server bundle (packages/mcp-server/dist/index.mjs)
# keeps two invariants around which packages are inlined vs. left as imports.
#
# 1. Packages that must be fully inlined (not declared as runtime dependencies,
#    so a residual import/require/dynamic-import would break the published
#    package at runtime):
#      - @pokesol/pokesol-text-parser-ts    (publish 物の dependencies に含めない方針)
#
# 2. Packages that must remain as external imports (declared as runtime
#    dependencies; inlining them would duplicate code the user's install
#    already provides and defeat version pinning):
#      - @smogon/calc
#      - @modelcontextprotocol/sdk
#      - zod
#
# This script fails (exit 1) if either invariant is violated.
#
# Intended to be invoked from CI (GitHub Actions) as well as locally.

set -euo pipefail

readonly REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
readonly DIST_FILE="${REPO_ROOT}/packages/mcp-server/dist/index.mjs"

readonly INLINED_PACKAGES=(
  "@pokesol/pokesol-text-parser-ts"
)

# publish 物の dependencies に宣言され、dist では import として残るべきパッケージ。
# inline されてしまうと利用者環境で重複したコードを抱え、版の固定も効かなくなる。
readonly EXTERNAL_PACKAGES=(
  "@smogon/calc"
  "@modelcontextprotocol/sdk"
  "zod"
)

if [[ ! -f "${DIST_FILE}" ]]; then
  echo "::error::dist bundle not found: ${DIST_FILE}" >&2
  echo "::error::run 'npm run build' before invoking this script" >&2
  exit 1
fi

found_hits=0

for pkg in "${INLINED_PACKAGES[@]}"; do
  # Each pattern matches one of: static ESM import, dynamic import(), or CJS
  # require(), targeting "<pkg>" or "<pkg>/<subpath>".
  pattern_static="from[[:space:]]+[\"'\`]${pkg}(/[^\"'\`]*)?[\"'\`]"
  pattern_dynamic="import[[:space:]]*\([[:space:]]*[\"'\`]${pkg}(/[^\"'\`]*)?[\"'\`][[:space:]]*\)"
  pattern_require="require[[:space:]]*\([[:space:]]*[\"'\`]${pkg}(/[^\"'\`]*)?[\"'\`][[:space:]]*\)"

  for pattern in "${pattern_static}" "${pattern_dynamic}" "${pattern_require}"; do
    if grep -E -n "${pattern}" "${DIST_FILE}" >/dev/null 2>&1; then
      echo "::error::unbundled ${pkg} reference detected in ${DIST_FILE}" >&2
      echo "::error::matching pattern: ${pattern}" >&2
      grep -E -n "${pattern}" "${DIST_FILE}" >&2 || true
      found_hits=1
    fi
  done
done

for pkg in "${EXTERNAL_PACKAGES[@]}"; do
  pattern_static="from[[:space:]]+[\"'\`]${pkg}(/[^\"'\`]*)?[\"'\`]"

  if ! grep -E -n "${pattern_static}" "${DIST_FILE}" >/dev/null 2>&1; then
    echo "::error::${pkg} is a runtime dependency but does not appear as an import in ${DIST_FILE}" >&2
    echo "::error::it was likely inlined; check deps.alwaysBundle in packages/mcp-server/tsdown.config.ts" >&2
    found_hits=1
  fi
done

if [[ "${found_hits}" -ne 0 ]]; then
  exit 1
fi

echo "OK: ${DIST_FILE} keeps inlined and external package boundaries as expected"
exit 0
