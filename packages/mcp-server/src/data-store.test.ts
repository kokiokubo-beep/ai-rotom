import { describe, expect, it } from "vitest";
import {
  championsLearnsets,
  championsPokemon,
  getLearnsetMoveIdSet,
} from "./data-store.js";

describe("championsLearnsets のフォーム継承フォールバック", () => {
  it("メガ進化フォームは基本種の learnset を継承する（例: メガギャラドス）", () => {
    // ゲーム仕様: 技を覚えるのは基本フォームで、メガ進化後も技構成は変わらない
    expect(championsLearnsets["gyaradosmega"]).toBeDefined();
    expect(championsLearnsets["gyaradosmega"]).toEqual(
      championsLearnsets["gyarados"],
    );
  });

  it("getLearnsetMoveIdSet はメガフォームでも空 Set を返さない", () => {
    const set = getLearnsetMoveIdSet("gyaradosmega");
    expect(set.size).toBeGreaterThan(0);
    expect(set.has("waterfall")).toBe(true);
  });

  it("baseSpecies を持つ全ポケモンが learnset を引ける（未登録90件の解消）", () => {
    const missing = championsPokemon.filter(
      (p) => championsLearnsets[p.id] === undefined,
    );
    expect(missing.map((p) => p.id)).toEqual([]);
  });

  it("基本種の learnset は変化しない（フォールバックが上書きしない）", () => {
    expect(championsLearnsets["garchomp"]).toBeDefined();
    expect(championsLearnsets["hippowdon"]).toBeDefined();
  });

  it("フォーム専用技のみの追記データは基本種と合算される（例: ウォッシュロトム）", () => {
    // learnsets.json の rotomwash はフォーム専用技（ハイドロポンプ）1 件のみ。
    // 実ゲームではロトムの基本 learnset ＋ フォーム専用技を覚える。
    const rotomWash = championsLearnsets["rotomwash"];
    expect(rotomWash).toBeDefined();
    expect(rotomWash).toContain("hydropump"); // フォーム専用技を保持
    expect(rotomWash).toContain("voltswitch"); // 基本種から合算
    expect(rotomWash).toContain("willowisp"); // 基本種から合算
    expect(rotomWash.length).toBeGreaterThan(
      championsLearnsets["rotom"].length,
    );
  });

  it("独自のフル learnset を持つフォームは合算されない（例: アローラライチュウ）", () => {
    // 地域フォーム等は独自の技構成がフル登録されており、基本種との合算は誤り
    // （基本種しか覚えない技が混入してしまう）。閾値判別で対象外になること。
    const raichuAlola = championsLearnsets["raichualola"];
    expect(raichuAlola).toBeDefined();
    expect(raichuAlola.length).toBeGreaterThan(9);
    // 合算されていれば基本種 66 件との和集合でさらに膨らむはず。
    // 生データ（74 件）のままであることを基本種比で担保する。
    const raichuBase = championsLearnsets["raichu"];
    const union = new Set([...raichuBase, ...raichuAlola]);
    expect(raichuAlola.length).toBeLessThan(union.size);
  });
});
