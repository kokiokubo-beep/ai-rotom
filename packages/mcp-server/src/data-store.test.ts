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
});
