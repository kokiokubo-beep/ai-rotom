import { describe, it, expect } from "vitest";
import { abilitiesById, toDataId } from "../../data-store";
import { abilityNameResolver } from "../../name-resolvers";

describe("get_ability_info logic", () => {
  describe("データ取得", () => {
    it("英語名から特性データが取得できる", () => {
      const entry = abilitiesById.get(toDataId("Blaze"));
      expect(entry).toBeDefined();
      expect(entry!.name).toBe("Blaze");
      expect(entry!.desc.length).toBeGreaterThan(0);
      expect(entry!.shortDesc.length).toBeGreaterThan(0);
    });

    it("日本語名から英語名に解決できる", () => {
      const englishName = abilityNameResolver.toEnglish("もうか");
      expect(englishName).toBe("Blaze");

      const entry = abilitiesById.get(toDataId(englishName!));
      expect(entry).toBeDefined();
      expect(entry!.name).toBe("Blaze");
    });

    it("英語名から日本語名に逆引きできる", () => {
      const jaName = abilityNameResolver.toJapanese("Blaze");
      expect(jaName).toBe("もうか");
    });

    it("日本語名からすべてのデータが復元できる", () => {
      const englishName = abilityNameResolver.toEnglish("てきおうりょく");
      expect(englishName).toBe("Adaptability");

      const entry = abilitiesById.get(toDataId(englishName!));
      expect(entry).toBeDefined();
      expect(entry!.name).toBe("Adaptability");
    });
  });

  describe("はどうのぼうご", () => {
    it("日本語名から英語名に解決でき、desc が返る", () => {
      const englishName = abilityNameResolver.toEnglish("はどうのぼうご");
      expect(englishName).toBe("Aura Guard");

      const entry = abilitiesById.get(toDataId(englishName!));
      expect(entry).toBeDefined();
      expect(entry!.desc.length).toBeGreaterThan(0);
    });

    it("英語名から特性データが取得でき、desc が返る", () => {
      const entry = abilitiesById.get(toDataId("Aura Guard"));
      expect(entry).toBeDefined();
      expect(entry!.name).toBe("Aura Guard");
      expect(entry!.desc.length).toBeGreaterThan(0);
    });
  });

  describe("ききかいひ", () => {
    it("日本語名から英語名に解決でき、desc が返る", () => {
      const englishName = abilityNameResolver.toEnglish("ききかいひ");
      expect(englishName).toBe("Emergency Exit");

      const entry = abilitiesById.get(toDataId(englishName!));
      expect(entry).toBeDefined();
      expect(entry!.desc.length).toBeGreaterThan(0);
    });

    it("英語名から特性データが取得でき、desc が返る", () => {
      const entry = abilitiesById.get(toDataId("Emergency Exit"));
      expect(entry).toBeDefined();
      expect(entry!.name).toBe("Emergency Exit");
      expect(entry!.desc.length).toBeGreaterThan(0);
    });
  });

  describe("追加特性 9 件", () => {
    // 件数が多いため table-driven に統一する
    it.each([
      { nameJa: "くさのけがわ", name: "Grass Pelt" },
      { nameJa: "ばんけん", name: "Guard Dog" },
      { nameJa: "リベロ", name: "Libero" },
      { nameJa: "サイコメイカー", name: "Psychic Surge" },
      { nameJa: "パンクロック", name: "Punk Rock" },
      { nameJa: "にげあし", name: "Run Away" },
      { nameJa: "こぼれダネ", name: "Seed Sower" },
      { nameJa: "はりこみ", name: "Stakeout" },
      { nameJa: "はがねのせいしん", name: "Steely Spirit" },
    ])(
      // Guard Dog / Stakeout / Libero は文言の確度が低いため、完全一致・部分一致は取らず非空のみ検証する
      "$nameJa（$name）が日英双方向で解決でき、desc / shortDesc が取得できる",
      ({ nameJa, name }) => {
        expect(abilityNameResolver.toEnglish(nameJa)).toBe(name);
        expect(abilityNameResolver.toJapanese(name)).toBe(nameJa);

        const entry = abilitiesById.get(toDataId(name));
        expect(entry).toBeDefined();
        expect(entry!.desc.length).toBeGreaterThan(0);
        expect(entry!.shortDesc.length).toBeGreaterThan(0);
      },
    );
  });

  describe("存在しない特性", () => {
    it("toEnglish で存在しない日本語名は undefined を返す", () => {
      const result = abilityNameResolver.toEnglish("ない特性");
      expect(result).toBeUndefined();
    });

    it("toDataId で存在しない ID は Map に無い", () => {
      const entry = abilitiesById.get(toDataId("NoSuchAbility"));
      expect(entry).toBeUndefined();
    });
  });
});
