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

  describe("追加持ち物 14 件", () => {
    const ITEMS = [
      { nameJa: "ふうせん", name: "Air Balloon" },
      { nameJa: "セグレイブナイト", name: "Baxcalibrite" },
      { nameJa: "しめつけバンド", name: "Binding Band" },
      { nameJa: "だっしゅつボタン", name: "Eject Button" },
      { nameJa: "エレキシード", name: "Electric Seed" },
      { nameJa: "グソクムシャナイト", name: "Golisopite" },
      { nameJa: "グラスシード", name: "Grassy Seed" },
      { nameJa: "ながねぎ", name: "Leek" },
      { nameJa: "ミストシード", name: "Misty Seed" },
      { nameJa: "ノーマルジュエル", name: "Normal Gem" },
      { nameJa: "サイコシード", name: "Psychic Seed" },
      { nameJa: "レッドカード", name: "Red Card" },
      { nameJa: "ゴツゴツメット", name: "Rocky Helmet" },
      { nameJa: "グランドコート", name: "Terrain Extender" },
    ];

    // 件数が多いため table-driven に統一する
    it.each(ITEMS)(
      "$nameJa（$name）が日英双方向で解決でき、desc が取得できる",
      ({ nameJa, name }) => {
        expect(itemNameResolver.toEnglish(nameJa)).toBe(name);
        expect(itemNameResolver.toJapanese(name)).toBe(nameJa);

        const entry = itemsById.get(toDataId(name));
        expect(entry).toBeDefined();
        expect(entry!.desc.length).toBeGreaterThan(0);
      },
    );

    const MEGA_STONE_NAMES = ["Baxcalibrite", "Golisopite"];
    const nonStoneNames = ITEMS.map((item) => item.name).filter(
      (name) => !MEGA_STONE_NAMES.includes(name),
    );

    it.each(nonStoneNames)(
      "%s は megaStone / megaEvolves が null になる",
      (name) => {
        const entry = itemsById.get(toDataId(name));
        expect(entry!.megaStone).toBeNull();
        expect(entry!.megaEvolves).toBeNull();
      },
    );
  });

  describe("グソクムシャナイト", () => {
    it("megaStone / megaEvolves が取得できる", () => {
      const entry = itemsById.get(toDataId("Golisopite"));
      expect(entry).toBeDefined();
      expect(entry!.megaStone).toBe("Golisopod-Mega");
      expect(entry!.megaEvolves).toBe("Golisopod");
    });

    it("日本語名で解決できる", () => {
      const englishName = itemNameResolver.toEnglish("グソクムシャナイト");
      expect(englishName).toBe("Golisopite");
    });
  });

  describe("セグレイブナイト", () => {
    it("megaStone / megaEvolves が取得できる", () => {
      const entry = itemsById.get(toDataId("Baxcalibrite"));
      expect(entry).toBeDefined();
      expect(entry!.megaStone).toBe("Baxcalibur-Mega");
      expect(entry!.megaEvolves).toBe("Baxcalibur");
    });

    it("日本語名で解決できる", () => {
      const englishName = itemNameResolver.toEnglish("セグレイブナイト");
      expect(englishName).toBe("Baxcalibrite");
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
