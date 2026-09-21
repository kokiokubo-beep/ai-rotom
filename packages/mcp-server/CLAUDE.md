# packages/mcp-server/

MCP プロトコル対応と具象データ供給を担うアプリケーション層。

## 位置付け

- リポジトリ唯一の npm workspace パッケージ
- `npx @nonz250/ai-rotom` で起動する MCP サーバーの実装
- shared のロジックに JSON データを注入して動かす

## エントリポイント

- `src/index.ts`: `#!/usr/bin/env node` shebang + `startServer()` 呼び出し
- `src/server.ts`: `McpServer` 生成 + 各ツールの `register*Tool` 呼び出し
- bin は `dist/index.mjs`（tsdown でビルド、JSON と shared 一式を bundle）

## コア層の役割

| ファイル | 役割 |
|---|---|
| `data-store.ts` | `@data/*.json` の import + 型 + id→entry Map + `pokemonEntryProvider` 実装 |
| `name-resolvers.ts` | `NameResolver` インスタンス (pokemon/move/ability/item/nature) |
| `instructions.ts` | MCP `instructions` テキスト（ポケチャン固有仕様の説明） |
| `server.ts` | MCP サーバー生成 + ツール登録 |

## データフロー

```
JSON (data/champions/)
  ↓ import (tsdown でインライン化)
data-store.ts → pokemonById Map / pokemonEntryProvider / 他 Map
  ↓
tools/ 各ツール → @ai-rotom/shared の DamageCalculatorAdapter に
                   pokemonEntryProvider を注入 (DI)
  ↓
@smogon/calc で計算 (pokemon.json の overrides が効く)
  ↓
MCP レスポンス
```

## 新規 JSON データ追加時の手順

1. `data/champions/` に JSON ファイルを追加
2. `data-store.ts` に以下を追加:
   - `import xxxData from "@data/xxx.json"`
   - 型定義 `interface XxxEntry { ... }`（shared に置くべき場合は `@ai-rotom/shared` から import）
   - `export const championsXxx: XxxEntry[] = xxxData as XxxEntry[]`
   - id → entry の Map: `export const xxxById = new Map(...)`
3. 必要なら `name-resolvers.ts` に `NameResolver` インスタンスを追加
4. 使用する tool で `../../data-store.js` 経由で import

## 新規 MCP ツール追加は `src/tools/CLAUDE.md` を参照

## 配布設定

- `package.json` の `files: ["dist", "LICENSE", "THIRD_PARTY_LICENSES.md"]` で
  dist とライセンス文書のみ同梱
- `bin: { "ai-rotom": "dist/index.mjs" }`
- tsdown が JSON と `@pokesol/pokesol-text-parser-ts` を bundle 内にインライン化するので、
  `data/` の物理同梱は不要
- `@smogon/calc` は利用者環境で `npm install` される（`dependencies` に宣言。
  `tsdown.config.ts` の `deps.alwaysBundle` には含めない）

## パッケージ依存関係

### Runtime dependencies（publish 物の `dependencies` に載る）

- `@modelcontextprotocol/sdk`: MCP SDK（npm registry から通常インストール）
- `@smogon/calc`: ダメージ計算エンジン。`0.12.0` に exact pin。root の
  Vitest / tsc からは workspace hoist 先の `node_modules/@smogon/calc` が解決される
- `zod`: 入力検証（npm registry から通常インストール）

### Bundle inline（publish 物にはファイルとして載るが `dependencies` には出ない）

- `@ai-rotom/shared`: alias 経由で参照するソースディレクトリ
- `@data/*` (JSON): tsdown が JSON import をインライン化
- `@pokesol/pokesol-text-parser-ts`: ESM-only / ランタイム依存ゼロのため
  `tsdown.config.ts` の `deps.alwaysBundle` でインライン化

### テスト実行時の @smogon/calc 解決経路

- 通常の Vitest（`npm test`）: mcp-server の `dependencies` 経由で hoist された
  `node_modules/@smogon/calc` を解決
- dist bundle 検証テスト（`npm run test:dist`）: `dist/index.mjs` を repo 内の
  `node_modules` から起動するため、常に解決に成功する。利用者環境の依存解決は
  ここでは検証できず、`scripts/pack-and-install-smoke.sh` の起動確認でしか
  検証できない

## 検証スクリプト

- `scripts/verify-dist-bundle.sh`: `dist/index.mjs` が inline すべきもの
  （`@pokesol/pokesol-text-parser-ts`）を inline し、external であるべきもの
  （`@smogon/calc` / `@modelcontextprotocol/sdk` / `zod`）を import として
  残しているかの双方向検証
- `scripts/pack-and-install-smoke.sh`: `npm pack` → tarball 展開検査 →
  scratch project への `npm install` → install 物の起動確認までを自動化。
  `ci.yml` の build job と `publish.yml` の両方で実行される

## `@smogon/calc` バージョン更新の手順

dependabot が起こす PR をマージし、検証スイート（`npm test` / `npm run build` /
`bash scripts/verify-dist-bundle.sh` / `npm run test:dist` /
`bash scripts/pack-and-install-smoke.sh`）を通す。

意図した版上げ以外で `package-lock.json` の `@smogon/calc` の integrity が
動いたらサプライチェーン事故として扱い、原因が確定するまで merge しない。

## 開発コマンド

```bash
# このパッケージのビルド
npm run build --workspace=@nonz250/ai-rotom

# ローカル実行 (手動テスト時)
node packages/mcp-server/dist/index.mjs
```
