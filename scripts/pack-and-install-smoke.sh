#!/usr/bin/env bash
#
# pack-and-install-smoke.sh
#
# Validate the publish tarball for @nonz250/ai-rotom:
#   1. `npm pack` the workspace into a tarball
#   2. Extract and inspect the tarball's static structure
#      - package.json must declare @smogon/calc as a runtime dependency
#      - top-level entries must match the expected shipping list exactly
#      - LICENSE and THIRD_PARTY_LICENSES.md must be shipped
#   3. `npm install` the tarball into a fresh scratch project to confirm the
#      package is installable as-is
#   4. Start the installed bin to confirm its external dependencies resolve
#      outside this repository
#
# Step 4 is the only check that exercises dependency resolution the way a user
# sees it: `npm run test:dist` runs the bundle from inside the repo, where the
# hoisted node_modules always satisfies the imports.
#
# JSON-RPC protocol behaviour is intentionally OUT OF SCOPE; that is handled by
# `npm run test:dist`. This script focuses on the shape of the published
# artifact, its installability, and whether it can start at all.

set -euo pipefail

readonly WORKSPACE_NAME='@nonz250/ai-rotom'
readonly REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
readonly EXTRACTED_PACKAGE_SUBDIR='package'

# npm は files フィールドに書かれていなくても package.json と README.md を同梱する。
# そのため files を読んで比較するのではなく、期待する集合を固定で持つ。
# files を増やしたらここも手で追随する。
readonly EXPECTED_TOP_LEVEL_ENTRIES=(
  'LICENSE'
  'README.md'
  'THIRD_PARTY_LICENSES.md'
  'dist'
  'package.json'
)

readonly REQUIRED_LICENSE_FILES=(
  'LICENSE'
  'THIRD_PARTY_LICENSES.md'
)

# 起動後この秒数だけ生存していれば、依存解決は通ったと判断する。
readonly STARTUP_WAIT_SECONDS=3
# MCP の stdio transport は stdin の EOF で正常終了する。/dev/null を渡すと
# 「依存解決に失敗して落ちた」のか「EOF で終了した」のか区別できなくなるため、
# 判定が終わるまで stdin を開いたままにしておく。
readonly STDIN_HOLD_SECONDS=10

WORK_DIR=''
SERVER_PID=''

cleanup() {
  if [[ -n "${SERVER_PID}" ]]; then
    kill "${SERVER_PID}" 2>/dev/null || true
  fi
  if [[ -n "${WORK_DIR}" && -d "${WORK_DIR}" ]]; then
    rm -rf "${WORK_DIR}"
  fi
}
trap cleanup EXIT

WORK_DIR="$(mktemp -d)"
readonly EXTRACT_DIR="${WORK_DIR}/extract"
readonly INSTALL_DIR="${WORK_DIR}/install"
mkdir -p "${EXTRACT_DIR}" "${INSTALL_DIR}"

echo ">>> Step 1/8: npm pack workspace=${WORKSPACE_NAME}"
(
  cd "${REPO_ROOT}"
  npm pack --workspace="${WORKSPACE_NAME}" --pack-destination "${WORK_DIR}" >/dev/null
)

# Resolve the tarball path (single tarball is expected under WORK_DIR root).
TARBALL="$(find "${WORK_DIR}" -maxdepth 1 -type f -name '*.tgz' -print -quit)"
readonly TARBALL
if [[ -z "${TARBALL}" || ! -f "${TARBALL}" ]]; then
  echo "::error::failed to locate tarball produced by npm pack under ${WORK_DIR}" >&2
  exit 1
fi
echo "  OK: tarball created at ${TARBALL}"

echo ">>> Step 2/8: extract tarball"
tar -xzf "${TARBALL}" -C "${EXTRACT_DIR}"
readonly PACKAGE_DIR="${EXTRACT_DIR}/${EXTRACTED_PACKAGE_SUBDIR}"
if [[ ! -d "${PACKAGE_DIR}" ]]; then
  echo "::error::expected extracted package directory at ${PACKAGE_DIR}" >&2
  exit 1
fi
echo "  OK: extracted to ${PACKAGE_DIR}"

echo ">>> Step 3/8: verify package.json declares @smogon/calc as a runtime dependency"
HAS_SMOGON_DEP="$(
  node --input-type=module -e "
    import { readFileSync } from 'node:fs';
    const pkg = JSON.parse(readFileSync(process.argv[1], 'utf8'));
    const deps = pkg.dependencies ?? {};
    process.stdout.write(Object.prototype.hasOwnProperty.call(deps, '@smogon/calc') ? 'yes' : 'no');
  " "${PACKAGE_DIR}/package.json"
)"
readonly HAS_SMOGON_DEP
if [[ "${HAS_SMOGON_DEP}" != 'yes' ]]; then
  echo "::error::package.json does not declare @smogon/calc as a runtime dependency" >&2
  echo "::error::the bundle imports it at runtime, so users would hit ERR_MODULE_NOT_FOUND" >&2
  exit 1
fi
echo "  OK: @smogon/calc is declared as a runtime dependency"

echo ">>> Step 4/8: verify top-level entries match the expected shipping list"
ACTUAL_TOP_LEVEL="$(cd "${PACKAGE_DIR}" && ls -A | LC_ALL=C sort)"
readonly ACTUAL_TOP_LEVEL
EXPECTED_TOP_LEVEL="$(printf '%s\n' "${EXPECTED_TOP_LEVEL_ENTRIES[@]}" | LC_ALL=C sort)"
readonly EXPECTED_TOP_LEVEL
if [[ "${ACTUAL_TOP_LEVEL}" != "${EXPECTED_TOP_LEVEL}" ]]; then
  echo "::error::published tarball top-level entries differ from the expected list" >&2
  echo "::error::check the files field in packages/mcp-server/package.json" >&2
  diff <(printf '%s\n' "${EXPECTED_TOP_LEVEL}") <(printf '%s\n' "${ACTUAL_TOP_LEVEL}") >&2 || true
  exit 1
fi
echo "  OK: top-level entries are exactly as expected"

echo ">>> Step 5/8: verify LICENSE and THIRD_PARTY_LICENSES.md are shipped"
for required_file in "${REQUIRED_LICENSE_FILES[@]}"; do
  if [[ ! -f "${PACKAGE_DIR}/${required_file}" ]]; then
    echo "::error::missing required file in published tarball: ${required_file}" >&2
    exit 1
  fi
  echo "  OK: ${required_file} is present"
done

echo ">>> Step 6/8: npm install tarball into a fresh scratch project"
(
  cd "${INSTALL_DIR}"
  npm init -y >/dev/null
  npm install "${TARBALL}" >/dev/null
)
echo "  OK: npm install succeeded"

echo ">>> Step 7/8: start the installed bin and confirm external deps resolve"
readonly INSTALLED_ENTRY="${INSTALL_DIR}/node_modules/${WORKSPACE_NAME}/dist/index.mjs"
readonly STARTUP_LOG="${WORK_DIR}/startup.log"
if [[ ! -f "${INSTALLED_ENTRY}" ]]; then
  echo "::error::installed entry point not found: ${INSTALLED_ENTRY}" >&2
  exit 1
fi
# 保証できるのは起動時に評価される static import の解決まで。lazy import や
# 条件付き require で読まれる依存が将来増えたら、この検証はすり抜ける。
sleep "${STDIN_HOLD_SECONDS}" | node "${INSTALLED_ENTRY}" >"${STARTUP_LOG}" 2>&1 &
SERVER_PID=$!
sleep "${STARTUP_WAIT_SECONDS}"
if ! kill -0 "${SERVER_PID}" 2>/dev/null; then
  echo "::error::installed bin exited within ${STARTUP_WAIT_SECONDS}s" >&2
  echo "::error::a runtime dependency is likely missing from package.json dependencies" >&2
  cat "${STARTUP_LOG}" >&2 || true
  exit 1
fi
kill "${SERVER_PID}" 2>/dev/null || true
wait "${SERVER_PID}" 2>/dev/null || true
SERVER_PID=''
echo "  OK: installed bin started and stayed alive for ${STARTUP_WAIT_SECONDS}s"

echo ">>> Step 8/8: done"
echo 'All pack/install smoke checks passed.'
exit 0
