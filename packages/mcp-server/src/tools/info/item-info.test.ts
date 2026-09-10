import { describe, it, expect } from "vitest";
import { itemsById, toDataId } from "../../data-store";
import { itemNameResolver } from "../../name-resolvers";

describe("get_item_info logic", () => {
  describe("データ取得", () => {
    it("英語名から持ち物データが取得できる", () => {
      const entry = itemsById.get(toDataId("Charizardite X"));
      expect(entry).toBeDefined();
      expect(entry!.name).toBe("Charizardite X");
      expect(entry!.megaStone).toBe("Charizard-Mega-X");
      expect(entry!.megaEvolves).toBe("Charizard");
    });

    it("日本語名から英語名に解決できる", () => {
      const englishName = itemNameResolver.toEnglish("リザードナイトＸ");
      expect(englishName).toBe("Charizardite X");

      const entry = itemsById.get(toDataId(englishName!));
      expect(entry).toBeDefined();
      expect(entry!.name).toBe("Charizardite X");
    });

    it("非メガストーンの持ち物は megaStone が null", () => {
      const entry = itemsById.get(toDataId("Aspear Berry"));
      expect(entry).toBeDefined();
      expect(entry!.megaStone).toBeNull();
      expect(entry!.megaEvolves).toBeNull();
    });
  });

  describe("メガストーン情報", () => {
    it("メガストーンは megaEvolves にポケモン名を持つ", () => {
      const entry = itemsById.get(toDataId("Charizardite X"));
      expect(entry!.megaStone).not.toBeNull();
      expect(entry!.megaEvolves).toBe("Charizard");
    });

    it("メガストーンは megaStone に進化後の名前を持つ", () => {
      const entry = itemsById.get(toDataId("Abomasite"));
      expect(entry!.megaStone).toBe("Abomasnow-Mega");
      expect(entry!.megaEvolves).toBe("Abomasnow");
    });
  });

  describe("Z メガストーン 3 件", () => {
    it("ルカリオナイトＺ の megaStone / megaEvolves が取得できる", () => {
      const entry = itemsById.get(toDataId("Lucarionite Z"));
      expect(entry).toBeDefined();
      expect(entry!.megaStone).toBe("Lucario-Mega-Z");
      expect(entry!.megaEvolves).toBe("Lucario");
    });

    it("ガブリアスナイトＺ の megaStone / megaEvolves が取得できる", () => {
      const entry = itemsById.get(toDataId("Garchompite Z"));
      expect(entry).toBeDefined();
      expect(entry!.megaStone).toBe("Garchomp-Mega-Z");
      expect(entry!.megaEvolves).toBe("Garchomp");
    });

    it("アブソルナイトＺ の megaStone / megaEvolves が取得できる", () => {
      const entry = itemsById.get(toDataId("Absolite Z"));
      expect(entry).toBeDefined();
      expect(entry!.megaStone).toBe("Absol-Mega-Z");
      expect(entry!.megaEvolves).toBe("Absol");
    });

    it("ルカリオナイトＺ が全角 Ｚ の日本語名で解決できる", () => {
      const englishName = itemNameResolver.toEnglish("ルカリオナイトＺ");
      expect(englishName).toBe("Lucarionite Z");
    });
  });

  describe("ボーマンダナイト", () => {
    it("megaStone / megaEvolves が取得できる", () => {
      const entry = itemsById.get(toDataId("Salamencite"));
      expect(entry).toBeDefined();
      expect(entry!.megaStone).toBe("Salamence-Mega");
      expect(entry!.megaEvolves).toBe("Salamence");
    });

    it("日本語名で解決できる", () => {
      const englishName = itemNameResolver.toEnglish("ボーマンダナイト");
      expect(englishName).toBe("Salamencite");
    });
  });

  describe("存在しない持ち物", () => {
    it("toEnglish で存在しない日本語名は undefined を返す", () => {
      const result = itemNameResolver.toEnglish("ないアイテム");
      expect(result).toBeUndefined();
    });

    it("toDataId で存在しない ID は Map に無い", () => {
      const entry = itemsById.get(toDataId("NoSuchItem"));
      expect(entry).toBeUndefined();
    });
  });
});
