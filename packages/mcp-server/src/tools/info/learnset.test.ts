import { describe, it, expect } from "vitest";
import {
  championsLearnsets,
  movesById,
  toDataId,
} from "../../data-store";
import {
  moveNameResolver,
  pokemonNameResolver,
} from "../../name-resolvers";

describe("get_learnset logic", () => {
  describe("データ取得", () => {
    it("英語名で learnset が取得できる", () => {
      const charizardId = toDataId("Charizard");
      const moveIds = championsLearnsets[charizardId];
      expect(moveIds).toBeDefined();
      expect(moveIds.length).toBeGreaterThan(0);
    });

    it("日本語名→英語名→learnset の経路で取得できる", () => {
      const englishName = pokemonNameResolver.toEnglish("リザードン");
      expect(englishName).toBe("Charizard");

      const moveIds = championsLearnsets[toDataId(englishName!)];
      expect(moveIds).toBeDefined();
      expect(moveIds.length).toBeGreaterThan(0);
    });

    it("learnset 内の各 move ID は movesById に登録されている", () => {
      const moveIds = championsLearnsets[toDataId("Charizard")];
      expect(moveIds).toBeDefined();

      for (const moveId of moveIds) {
        const entry = movesById.get(moveId);
        expect(entry, `moveId=${moveId} not found in movesById`).toBeDefined();
      }
    });

    it("リザードンは「かえんほうしゃ」を覚える", () => {
      const moveIds = championsLearnsets[toDataId("Charizard")];
      const flamethrowerId = toDataId("Flamethrower");
      expect(moveIds).toContain(flamethrowerId);
    });

    it("move ID から英名・日本語名が取得できる", () => {
      const moveId = toDataId("Flamethrower");
      const entry = movesById.get(moveId);
      expect(entry!.name).toBe("Flamethrower");
      expect(moveNameResolver.toJapanese(entry!.name)).toBe("かえんほうしゃ");
    });
  });

  describe("存在しないポケモン", () => {
    it("learnset に存在しない ID は undefined", () => {
      const moveIds = championsLearnsets[toDataId("NoSuchPokemon")];
      expect(moveIds).toBeUndefined();
    });
  });

  describe("追加した learnset 26 キー", () => {
    // 件数が多いため table-driven に統一する。件数固定はマージ漏れ・二重マージの検知が目的。
    it.each([
      { id: "arboliva", count: 44 },
      { id: "baxcalibur", count: 51 },
      { id: "cinderace", count: 64 },
      { id: "farfetchd", count: 50 },
      { id: "gogoat", count: 54 },
      { id: "golisopod", count: 67 },
      { id: "grapploct", count: 49 },
      { id: "indeedee", count: 46 },
      { id: "indeedeef", count: 45 },
      { id: "inteleon", count: 62 },
      { id: "mabosstiff", count: 44 },
      { id: "mrmime", count: 77 },
      { id: "pawmot", count: 64 },
      { id: "perrserker", count: 74 },
      { id: "persian", count: 66 },
      { id: "persianalola", count: 73 },
      { id: "pincurchin", count: 48 },
      { id: "rillaboom", count: 67 },
      { id: "salamence", count: 62 },
      { id: "sirfetchd", count: 48 },
      { id: "squawkabilly", count: 43 },
      { id: "swalot", count: 62 },
      { id: "thievul", count: 51 },
      { id: "toxtricity", count: 68 },
      { id: "toxtricitylowkey", count: 68 },
      { id: "wigglytuff", count: 98 },
    ])("$id の learnset が $count 件になる", ({ id, count }) => {
      expect(championsLearnsets[id]).toBeDefined();
      expect(championsLearnsets[id].length).toBe(count);
    });

    it.each([
      { pokemonJa: "エースバーン", moveJa: "かえんボール" },
      { pokemonJa: "ゴリランダー", moveJa: "ドラムアタック" },
      { pokemonJa: "パーモット", moveJa: "さいきのいのり" },
      { pokemonJa: "インテレオン", moveJa: "ねらいうち" },
      { pokemonJa: "ストリンダー(ロー)", moveJa: "オーバードライブ" },
    ])("$pokemonJa は専用技「$moveJa」を覚える", ({ pokemonJa, moveJa }) => {
      const pokemonEn = pokemonNameResolver.toEnglish(pokemonJa);
      const moveEn = moveNameResolver.toEnglish(moveJa);
      expect(pokemonEn).toBeDefined();
      expect(moveEn).toBeDefined();

      const learnset = championsLearnsets[toDataId(pokemonEn!)];
      expect(learnset).toContain(toDataId(moveEn!));
    });
  });
});
