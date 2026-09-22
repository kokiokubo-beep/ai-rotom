import { describe, it, expect } from "vitest";
import {
  pokemonNameResolver,
  abilityNameResolver,
} from "../../name-resolvers";
import {
  championsLearnsets,
  championsPokemon,
  pokemonById,
  toDataId,
} from "../../data-store";
import { buildPokemonInfoResult } from "./pokemon-info";

/**
 * pokemon-info.ts のロジックを直接テストする。
 * MCP ツールの登録はサーバーに依存するため、
 * ここでは pokemon.json ベースのデータ取得ロジックの正しさを検証する。
 */
describe("get_pokemon_info", () => {
  describe("日本語名での情報取得", () => {
    it("日本語名からポケモン情報が取得できる", () => {
      const inputName = "リザードン";
      const englishName = pokemonNameResolver.toEnglish(inputName);
      expect(englishName).toBe("Charizard");

      const entry = pokemonById.get(toDataId(englishName!));
      expect(entry).toBeDefined();
      expect(entry!.name).toBe("Charizard");
      expect(entry!.types).toContain("Fire");
      expect(entry!.types).toContain("Flying");
      expect(entry!.baseStats.hp).toBe(78);
      expect(entry!.baseStats.atk).toBe(84);
      expect(entry!.baseStats.def).toBe(78);
      expect(entry!.baseStats.spa).toBe(109);
      expect(entry!.baseStats.spd).toBe(85);
      expect(entry!.baseStats.spe).toBe(100);
    });

    it("特性の日本語名が取得できる", () => {
      const inputName = "リザードン";
      const englishName = pokemonNameResolver.toEnglish(inputName)!;
      const entry = pokemonById.get(toDataId(englishName))!;
      expect(entry.abilities).toContain("Blaze");

      const abilityJa = abilityNameResolver.toJapanese("Blaze");
      expect(abilityJa).toBe("もうか");
    });

    it("別フォルムが存在するポケモンの otherFormes が取得できる", () => {
      const englishName = pokemonNameResolver.toEnglish("リザードン")!;
      const entry = pokemonById.get(toDataId(englishName))!;
      expect(entry.otherFormes).not.toBeNull();
      expect(entry.otherFormes).toContain("Charizard-Mega-X");
      expect(entry.otherFormes).toContain("Charizard-Mega-Y");
    });

    it("learnableMoveCount が learnset の件数と一致する", () => {
      const englishName = pokemonNameResolver.toEnglish("リザードン")!;
      const learnset = championsLearnsets[toDataId(englishName)];
      expect(learnset).toBeDefined();
      expect(learnset.length).toBeGreaterThan(0);
    });

    it("メガスターミーの修正後種族値が反映される", () => {
      // pokemon.json でメガスターミーの atk は 140 → 100 に修正済み
      const entry = pokemonById.get(toDataId("Starmie-Mega"))!;
      expect(entry.baseStats.atk).toBe(100);
      expect(entry.abilities).toContain("Huge Power");
    });
  });

  describe("Z メガシンカ 3 体", () => {
    it("メガルカリオZ の types / baseStats / abilities / weightkg が取得できる", () => {
      const entry = pokemonById.get(toDataId("Lucario-Mega-Z"))!;
      expect(entry.types).toEqual(["Fighting", "Steel"]);
      expect(entry.baseStats.hp).toBe(70);
      expect(entry.baseStats.atk).toBe(100);
      expect(entry.baseStats.def).toBe(70);
      expect(entry.baseStats.spa).toBe(164);
      expect(entry.baseStats.spd).toBe(70);
      expect(entry.baseStats.spe).toBe(151);
      expect(entry.abilities).toEqual(["Aura Guard"]);
      expect(entry.weightkg).toBe(49.4);
    });

    it("メガガブリアスZ の types / baseStats / abilities / weightkg が取得できる", () => {
      const entry = pokemonById.get(toDataId("Garchomp-Mega-Z"))!;
      expect(entry.types).toEqual(["Dragon"]);
      expect(entry.baseStats.hp).toBe(108);
      expect(entry.baseStats.atk).toBe(130);
      expect(entry.baseStats.def).toBe(85);
      expect(entry.baseStats.spa).toBe(141);
      expect(entry.baseStats.spd).toBe(85);
      expect(entry.baseStats.spe).toBe(151);
      expect(entry.abilities).toEqual(["Levitate"]);
      expect(entry.weightkg).toBe(99);
    });

    it("メガアブソルZ の types / baseStats / abilities / weightkg が取得できる", () => {
      const entry = pokemonById.get(toDataId("Absol-Mega-Z"))!;
      expect(entry.types).toEqual(["Dark", "Ghost"]);
      expect(entry.baseStats.hp).toBe(65);
      expect(entry.baseStats.atk).toBe(154);
      expect(entry.baseStats.def).toBe(60);
      expect(entry.baseStats.spa).toBe(75);
      expect(entry.baseStats.spd).toBe(60);
      expect(entry.baseStats.spe).toBe(151);
      expect(entry.abilities).toEqual(["Sharpness"]);
      expect(entry.weightkg).toBe(49);
    });

    it("ルカリオの otherFormes が非 Z メガを先頭にした 2 件になる", () => {
      const entry = pokemonById.get(toDataId("Lucario"))!;
      expect(entry.otherFormes).toEqual(["Lucario-Mega", "Lucario-Mega-Z"]);
    });

    it("ガブリアスの otherFormes が非 Z メガを先頭にした 2 件になる", () => {
      const entry = pokemonById.get(toDataId("Garchomp"))!;
      expect(entry.otherFormes).toEqual(["Garchomp-Mega", "Garchomp-Mega-Z"]);
    });

    it("アブソルの otherFormes が非 Z メガを先頭にした 2 件になる", () => {
      const entry = pokemonById.get(toDataId("Absol"))!;
      expect(entry.otherFormes).toEqual(["Absol-Mega", "Absol-Mega-Z"]);
    });

    it("メガルカリオZ が半角 Z の日本語名で解決できる", () => {
      const englishName = pokemonNameResolver.toEnglish("メガルカリオZ");
      expect(englishName).toBe("Lucario-Mega-Z");
    });
  });

  describe("ゴリランダー・セグレイブ", () => {
    it("ゴリランダー の types / baseStats / abilities / weightkg が取得できる", () => {
      const entry = pokemonById.get(toDataId("Rillaboom"))!;
      expect(entry.types).toEqual(["Grass"]);
      expect(entry.baseStats.hp).toBe(100);
      expect(entry.baseStats.atk).toBe(125);
      expect(entry.baseStats.def).toBe(90);
      expect(entry.baseStats.spa).toBe(60);
      expect(entry.baseStats.spd).toBe(70);
      expect(entry.baseStats.spe).toBe(85);
      expect(entry.abilities).toEqual(["Overgrow", "Grassy Surge"]);
      expect(entry.weightkg).toBe(90);
    });

    it("セグレイブ の types / baseStats / abilities / weightkg が取得できる", () => {
      const entry = pokemonById.get(toDataId("Baxcalibur"))!;
      expect(entry.types).toEqual(["Dragon", "Ice"]);
      expect(entry.baseStats.hp).toBe(115);
      expect(entry.baseStats.atk).toBe(145);
      expect(entry.baseStats.def).toBe(92);
      expect(entry.baseStats.spa).toBe(75);
      expect(entry.baseStats.spd).toBe(86);
      expect(entry.baseStats.spe).toBe(87);
      expect(entry.abilities).toEqual(["Thermal Exchange", "Ice Body"]);
      expect(entry.weightkg).toBe(210);
    });

    it("ゴリランダー が日本語名で解決できる", () => {
      const englishName = pokemonNameResolver.toEnglish("ゴリランダー");
      expect(englishName).toBe("Rillaboom");
    });

    it("セグレイブ が日本語名で解決できる", () => {
      const englishName = pokemonNameResolver.toEnglish("セグレイブ");
      expect(englishName).toBe("Baxcalibur");
    });
  });

  describe("ボーマンダ・メガボーマンダ・グソクムシャ", () => {
    it("ボーマンダ の types / baseStats / abilities / weightkg が取得できる", () => {
      const entry = pokemonById.get(toDataId("Salamence"))!;
      expect(entry.types).toEqual(["Dragon", "Flying"]);
      expect(entry.baseStats.hp).toBe(95);
      expect(entry.baseStats.atk).toBe(135);
      expect(entry.baseStats.def).toBe(80);
      expect(entry.baseStats.spa).toBe(110);
      expect(entry.baseStats.spd).toBe(80);
      expect(entry.baseStats.spe).toBe(100);
      expect(entry.abilities).toEqual(["Intimidate", "Moxie"]);
      expect(entry.weightkg).toBe(102.6);
    });

    it("メガボーマンダ の types / baseStats / abilities / weightkg が取得できる", () => {
      const entry = pokemonById.get(toDataId("Salamence-Mega"))!;
      expect(entry.types).toEqual(["Dragon", "Flying"]);
      expect(entry.baseStats.hp).toBe(95);
      expect(entry.baseStats.atk).toBe(145);
      expect(entry.baseStats.def).toBe(130);
      expect(entry.baseStats.spa).toBe(120);
      expect(entry.baseStats.spd).toBe(90);
      expect(entry.baseStats.spe).toBe(120);
      expect(entry.abilities).toEqual(["Aerilate"]);
      expect(entry.weightkg).toBe(112.6);
    });

    it("グソクムシャ の types / baseStats / abilities / weightkg が取得できる", () => {
      const entry = pokemonById.get(toDataId("Golisopod"))!;
      expect(entry.types).toEqual(["Bug", "Water"]);
      expect(entry.baseStats.hp).toBe(75);
      expect(entry.baseStats.atk).toBe(125);
      expect(entry.baseStats.def).toBe(140);
      expect(entry.baseStats.spa).toBe(60);
      expect(entry.baseStats.spd).toBe(90);
      expect(entry.baseStats.spe).toBe(40);
      expect(entry.abilities).toEqual(["Emergency Exit"]);
      expect(entry.weightkg).toBe(108);
    });

    it("ボーマンダの otherFormes が [Salamence-Mega] になる", () => {
      const entry = pokemonById.get(toDataId("Salamence"))!;
      expect(entry.otherFormes).toEqual(["Salamence-Mega"]);
    });

    it("ボーマンダ が日本語名で解決できる", () => {
      const englishName = pokemonNameResolver.toEnglish("ボーマンダ");
      expect(englishName).toBe("Salamence");
    });

    it("メガボーマンダ が日本語名で解決できる", () => {
      const englishName = pokemonNameResolver.toEnglish("メガボーマンダ");
      expect(englishName).toBe("Salamence-Mega");
    });

    it("グソクムシャ が日本語名で解決できる", () => {
      const englishName = pokemonNameResolver.toEnglish("グソクムシャ");
      expect(englishName).toBe("Golisopod");
    });
  });

  describe("追加ポケモン 27 種の基礎データ", () => {
    // 件数が多いため table-driven に統一する
    it.each([
      {
        nameJa: "プクリン",
        name: "Wigglytuff",
        types: ["Normal", "Fairy"],
        baseStats: { hp: 140, atk: 70, def: 45, spa: 85, spd: 50, spe: 45 },
        weightkg: 12,
        abilities: ["Cute Charm", "Competitive", "Frisk"],
      },
      {
        nameJa: "ペルシアン",
        name: "Persian",
        types: ["Normal"],
        baseStats: { hp: 65, atk: 70, def: 60, spa: 65, spd: 65, spe: 115 },
        weightkg: 32,
        abilities: ["Limber", "Technician", "Unnerve"],
      },
      {
        nameJa: "アローラペルシアン",
        name: "Persian-Alola",
        types: ["Dark"],
        baseStats: { hp: 65, atk: 60, def: 60, spa: 75, spd: 65, spe: 115 },
        weightkg: 33,
        abilities: ["Fur Coat", "Technician", "Rattled"],
      },
      {
        nameJa: "カモネギ",
        name: "Farfetch'd",
        types: ["Normal", "Flying"],
        baseStats: { hp: 52, atk: 90, def: 55, spa: 58, spd: 62, spe: 60 },
        weightkg: 15,
        abilities: ["Keen Eye", "Inner Focus", "Defiant"],
      },
      {
        nameJa: "バリヤード",
        name: "Mr. Mime",
        types: ["Psychic", "Fairy"],
        baseStats: { hp: 40, atk: 45, def: 65, spa: 100, spd: 120, spe: 90 },
        weightkg: 54.5,
        abilities: ["Soundproof", "Filter", "Technician"],
      },
      {
        nameJa: "マルノーム",
        name: "Swalot",
        types: ["Poison"],
        baseStats: { hp: 100, atk: 73, def: 83, spa: 73, spd: 83, spe: 55 },
        weightkg: 80,
        abilities: ["Liquid Ooze", "Sticky Hold", "Gluttony"],
      },
      {
        nameJa: "ゴーゴート",
        name: "Gogoat",
        types: ["Grass"],
        baseStats: { hp: 123, atk: 100, def: 62, spa: 97, spd: 81, spe: 68 },
        weightkg: 91,
        abilities: ["Sap Sipper", "Grass Pelt"],
      },
      {
        nameJa: "エースバーン",
        name: "Cinderace",
        types: ["Fire"],
        baseStats: { hp: 80, atk: 116, def: 75, spa: 65, spd: 75, spe: 119 },
        weightkg: 33,
        abilities: ["Blaze", "Libero"],
      },
      {
        nameJa: "インテレオン",
        name: "Inteleon",
        types: ["Water"],
        baseStats: { hp: 70, atk: 85, def: 65, spa: 125, spd: 65, spe: 120 },
        weightkg: 45.2,
        abilities: ["Torrent", "Sniper"],
      },
      {
        nameJa: "フォクスライ",
        name: "Thievul",
        types: ["Dark"],
        baseStats: { hp: 70, atk: 58, def: 58, spa: 87, spd: 92, spe: 90 },
        weightkg: 19.9,
        abilities: ["Run Away", "Unburden", "Stakeout"],
      },
      {
        nameJa: "ストリンダー(ハイ)",
        name: "Toxtricity",
        types: ["Electric", "Poison"],
        baseStats: { hp: 75, atk: 98, def: 70, spa: 114, spd: 70, spe: 75 },
        weightkg: 40,
        abilities: ["Punk Rock", "Plus", "Technician"],
      },
      {
        nameJa: "ストリンダー(ロー)",
        name: "Toxtricity-Low-Key",
        types: ["Electric", "Poison"],
        baseStats: { hp: 75, atk: 98, def: 70, spa: 114, spd: 70, spe: 75 },
        weightkg: 40,
        abilities: ["Punk Rock", "Minus", "Technician"],
      },
      {
        nameJa: "オトスパス",
        name: "Grapploct",
        types: ["Fighting"],
        baseStats: { hp: 80, atk: 118, def: 90, spa: 70, spd: 80, spe: 42 },
        weightkg: 39,
        abilities: ["Limber", "Technician"],
      },
      {
        nameJa: "ニャイキング",
        name: "Perrserker",
        types: ["Steel"],
        baseStats: { hp: 70, atk: 110, def: 100, spa: 50, spd: 60, spe: 50 },
        weightkg: 28,
        abilities: ["Battle Armor", "Tough Claws", "Steely Spirit"],
      },
      {
        nameJa: "ネギガナイト",
        name: "Sirfetch'd",
        types: ["Fighting"],
        baseStats: { hp: 62, atk: 135, def: 95, spa: 68, spd: 82, spe: 65 },
        weightkg: 117,
        abilities: ["Steadfast", "Scrappy"],
      },
      {
        nameJa: "バチンウニ",
        name: "Pincurchin",
        types: ["Electric"],
        baseStats: { hp: 48, atk: 101, def: 95, spa: 91, spd: 85, spe: 15 },
        weightkg: 1,
        abilities: ["Lightning Rod", "Electric Surge"],
      },
      {
        nameJa: "イエッサン(オス)",
        name: "Indeedee",
        types: ["Psychic", "Normal"],
        baseStats: { hp: 60, atk: 65, def: 55, spa: 105, spd: 95, spe: 95 },
        weightkg: 28,
        abilities: ["Inner Focus", "Synchronize", "Psychic Surge"],
      },
      {
        nameJa: "イエッサン(メス)",
        name: "Indeedee-F",
        types: ["Psychic", "Normal"],
        baseStats: { hp: 70, atk: 55, def: 65, spa: 95, spd: 105, spe: 85 },
        weightkg: 28,
        abilities: ["Own Tempo", "Synchronize", "Psychic Surge"],
      },
      {
        nameJa: "パーモット",
        name: "Pawmot",
        types: ["Electric", "Fighting"],
        baseStats: { hp: 70, atk: 115, def: 70, spa: 70, spd: 60, spe: 105 },
        weightkg: 41,
        abilities: ["Volt Absorb", "Natural Cure", "Iron Fist"],
      },
      {
        nameJa: "オリーヴァ",
        name: "Arboliva",
        types: ["Grass", "Normal"],
        baseStats: { hp: 78, atk: 69, def: 90, spa: 125, spd: 109, spe: 39 },
        weightkg: 48.2,
        abilities: ["Seed Sower", "Harvest"],
      },
      {
        nameJa: "イキリンコ(グリーンフェザー)",
        name: "Squawkabilly",
        types: ["Normal", "Flying"],
        baseStats: { hp: 82, atk: 96, def: 51, spa: 45, spd: 51, spe: 92 },
        weightkg: 2.4,
        abilities: ["Intimidate", "Hustle", "Guts"],
      },
      {
        nameJa: "イキリンコ(ブルーフェザー)",
        name: "Squawkabilly-Blue",
        types: ["Normal", "Flying"],
        baseStats: { hp: 82, atk: 96, def: 51, spa: 45, spd: 51, spe: 92 },
        weightkg: 2.4,
        abilities: ["Intimidate", "Hustle", "Guts"],
      },
      {
        nameJa: "イキリンコ(イエローフェザー)",
        name: "Squawkabilly-Yellow",
        types: ["Normal", "Flying"],
        baseStats: { hp: 82, atk: 96, def: 51, spa: 45, spd: 51, spe: 92 },
        weightkg: 2.4,
        abilities: ["Intimidate", "Hustle", "Sheer Force"],
      },
      {
        nameJa: "イキリンコ(ホワイトフェザー)",
        name: "Squawkabilly-White",
        types: ["Normal", "Flying"],
        baseStats: { hp: 82, atk: 96, def: 51, spa: 45, spd: 51, spe: 92 },
        weightkg: 2.4,
        abilities: ["Intimidate", "Hustle", "Sheer Force"],
      },
      {
        nameJa: "マフィティフ",
        name: "Mabosstiff",
        types: ["Dark"],
        baseStats: { hp: 80, atk: 120, def: 90, spa: 60, spd: 70, spe: 85 },
        weightkg: 61,
        abilities: ["Intimidate", "Guard Dog", "Stakeout"],
      },
      {
        nameJa: "メガグソクムシャ",
        name: "Golisopod-Mega",
        types: ["Bug", "Steel"],
        baseStats: { hp: 75, atk: 150, def: 175, spa: 70, spd: 120, spe: 40 },
        weightkg: 148,
        abilities: ["Tough Claws"],
      },
      {
        nameJa: "メガセグレイブ",
        name: "Baxcalibur-Mega",
        baseStats: {
          hp: 115,
          atk: 175,
          def: 117,
          spa: 105,
          spd: 101,
          spe: 87,
        },
        types: ["Dragon", "Ice"],
        weightkg: 315,
        abilities: ["Thermal Exchange"],
      },
    ])(
      "$nameJa（$name）の types / baseStats / abilities / weightkg が取得でき、日本語名で解決できる",
      ({ nameJa, name, types, baseStats, weightkg, abilities }) => {
        const englishName = pokemonNameResolver.toEnglish(nameJa);
        expect(englishName).toBe(name);

        const entry = pokemonById.get(toDataId(englishName!));
        expect(entry).toBeDefined();
        expect(entry!.types).toEqual(types);
        expect(entry!.baseStats).toEqual(baseStats);
        expect(entry!.weightkg).toBe(weightkg);
        expect(entry!.abilities).toEqual(abilities);
      },
    );
  });

  describe("新フォルムの otherFormes / baseSpecies", () => {
    it("ペルシアンの otherFormes が [Persian-Alola] になる", () => {
      const entry = pokemonById.get(toDataId("Persian"))!;
      expect(entry.otherFormes).toEqual(["Persian-Alola"]);
    });

    it("ストリンダー(ハイ)の otherFormes が [Toxtricity-Low-Key] になる", () => {
      const entry = pokemonById.get(toDataId("Toxtricity"))!;
      expect(entry.otherFormes).toEqual(["Toxtricity-Low-Key"]);
    });

    it("イエッサン(オス)の otherFormes が [Indeedee-F] になる", () => {
      const entry = pokemonById.get(toDataId("Indeedee"))!;
      expect(entry.otherFormes).toEqual(["Indeedee-F"]);
    });

    it("イキリンコ(グリーンフェザー)の otherFormes が他 3 フェザーになる", () => {
      const entry = pokemonById.get(toDataId("Squawkabilly"))!;
      expect(entry.otherFormes).toEqual([
        "Squawkabilly-Blue",
        "Squawkabilly-White",
        "Squawkabilly-Yellow",
      ]);
    });

    it("グソクムシャの otherFormes が [Golisopod-Mega] になる", () => {
      const entry = pokemonById.get(toDataId("Golisopod"))!;
      expect(entry.otherFormes).toEqual(["Golisopod-Mega"]);
    });

    it("セグレイブの otherFormes が [Baxcalibur-Mega] になる", () => {
      const entry = pokemonById.get(toDataId("Baxcalibur"))!;
      expect(entry.otherFormes).toEqual(["Baxcalibur-Mega"]);
    });

    it.each([
      { name: "Persian-Alola", baseSpecies: "Persian" },
      { name: "Toxtricity-Low-Key", baseSpecies: "Toxtricity" },
      { name: "Indeedee-F", baseSpecies: "Indeedee" },
      { name: "Squawkabilly-Blue", baseSpecies: "Squawkabilly" },
      { name: "Squawkabilly-White", baseSpecies: "Squawkabilly" },
      { name: "Squawkabilly-Yellow", baseSpecies: "Squawkabilly" },
      { name: "Golisopod-Mega", baseSpecies: "Golisopod" },
      { name: "Baxcalibur-Mega", baseSpecies: "Baxcalibur" },
    ])(
      "$name の baseSpecies が $baseSpecies になる",
      ({ name, baseSpecies }) => {
        const entry = pokemonById.get(toDataId(name))!;
        expect(entry.baseSpecies).toBe(baseSpecies);
      },
    );
  });

  describe("英語名での情報取得", () => {
    it("英語名からポケモン情報が取得できる", () => {
      const inputName = "Garchomp";
      expect(pokemonNameResolver.hasEnglishName(inputName)).toBe(true);

      const entry = pokemonById.get(toDataId(inputName));
      expect(entry).toBeDefined();
      expect(entry!.name).toBe("Garchomp");
      expect(entry!.types).toContain("Dragon");
      expect(entry!.types).toContain("Ground");
    });

    it("英語名から日本語名が逆引きできる", () => {
      const nameJa = pokemonNameResolver.toJapanese("Garchomp");
      expect(nameJa).toBe("ガブリアス");
    });
  });

  describe("存在しないポケモン", () => {
    it("存在しない日本語名で toEnglish が undefined を返す", () => {
      const result = pokemonNameResolver.toEnglish("ソニック");
      expect(result).toBeUndefined();
    });

    it("存在しない英語名で hasEnglishName が false を返す", () => {
      const result = pokemonNameResolver.hasEnglishName("Sonic");
      expect(result).toBe(false);
    });

    it("類似候補が提示される", () => {
      const suggestions = pokemonNameResolver.suggestSimilar("リザード");
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });

  describe("learnset 追補後の learnableMoveCount", () => {
    it("追加ポケモンの learnableMoveCount が数値になる", () => {
      const entry = pokemonById.get(toDataId("Cinderace"))!;
      const result = buildPokemonInfoResult(entry);
      expect(result.learnableMoveCount).not.toBeNull();
      expect(result.learnableMoveCount).toBeGreaterThan(0);
    });

    it("メガシンカ後のフォルムは基本種の learnset を継承する（フォーク独自）", () => {
      // ゲーム仕様: 技を覚えるのは基本フォームで、メガ進化後も技構成は変わらない。
      // 本家はメガを learnset 未登録のまま扱うが、フォークは baseSpecies から継承させる。
      const entry = pokemonById.get(toDataId("Starmie-Mega"))!;
      const base = pokemonById.get(toDataId("Starmie"))!;
      const result = buildPokemonInfoResult(entry);
      const baseResult = buildPokemonInfoResult(base);
      expect(result.learnableMoveCount).toBe(baseResult.learnableMoveCount);
      expect(result.learnableMoveCount).toBeGreaterThan(0);
    });
  });
});

describe("search_pokemon", () => {
  describe("タイプでの絞り込み", () => {
    it("Fire タイプのポケモンだけが返される", () => {
      const results = championsPokemon.filter((p) =>
        p.types.includes("Fire"),
      );
      expect(results.length).toBeGreaterThan(0);
      for (const entry of results) {
        expect(entry.types).toContain("Fire");
      }
    });

    it("Dragon タイプのポケモンが検索できる", () => {
      const results = championsPokemon
        .filter((p) => p.types.includes("Dragon"))
        .map((p) => p.name);
      expect(results.length).toBeGreaterThan(0);
      expect(results).toContain("Garchomp");
      expect(results).toContain("Dragonite");
    });
  });

  describe("種族値の下限での絞り込み", () => {
    it("攻撃力 130 以上のポケモンだけが返される", () => {
      const MIN_ATK = 130;
      const results = championsPokemon.filter(
        (p) => p.baseStats.atk >= MIN_ATK,
      );
      expect(results.length).toBeGreaterThan(0);
      for (const r of results) {
        expect(r.baseStats.atk).toBeGreaterThanOrEqual(MIN_ATK);
      }
    });

    it("素早さ 120 以上のポケモンだけが返される", () => {
      const MIN_SPE = 120;
      const results = championsPokemon.filter(
        (p) => p.baseStats.spe >= MIN_SPE,
      );
      expect(results.length).toBeGreaterThan(0);
      for (const r of results) {
        expect(r.baseStats.spe).toBeGreaterThanOrEqual(MIN_SPE);
      }
    });

    it("複数の種族値条件で絞り込める", () => {
      const MIN_ATK = 100;
      const MIN_SPE = 100;
      const results = championsPokemon
        .filter(
          (p) =>
            p.baseStats.atk >= MIN_ATK && p.baseStats.spe >= MIN_SPE,
        )
        .map((p) => p.name);
      expect(results.length).toBeGreaterThan(0);
      // Garchomp (atk:130, spe:102) が含まれるはず
      expect(results).toContain("Garchomp");
    });
  });

  describe("条件なしの検索", () => {
    it("pokemon.json に 1 件以上のエントリが存在する", () => {
      expect(championsPokemon.length).toBeGreaterThan(0);
    });
  });
});
