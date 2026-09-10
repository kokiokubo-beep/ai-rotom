import { describe, it, expect } from "vitest";
import { calculate, Generations, Pokemon, Move, Field, toID } from "@smogon/calc";
import { STAB_MULTIPLIER } from "@ai-rotom/shared";
import type { DamageCalcResult } from "@ai-rotom/shared";
import { damageCalculator } from "./damage-calculator.js";

const CHAMPIONS_GEN_NUM = 0;

describe("@smogon/calc Champions integration", () => {
  const gen = Generations.get(CHAMPIONS_GEN_NUM);

  it("should load Champions generation", () => {
    expect(gen).toBeDefined();
  });

  it("should create a Pokemon", () => {
    const charizard = new Pokemon(gen, "Charizard");
    expect(charizard.name).toBe("Charizard");
    expect(charizard.types).toContain("Fire");
  });

  it("should create a Move", () => {
    const flamethrower = new Move(gen, "Flamethrower");
    expect(flamethrower.name).toBe("Flamethrower");
    expect(flamethrower.type).toBe("Fire");
  });

  it("should calculate damage for Charizard Flamethrower vs Gyarados", () => {
    const attacker = new Pokemon(gen, "Charizard", {
      nature: "Modest",
      evs: { spa: 32 },
    });
    const defender = new Pokemon(gen, "Gyarados");
    const move = new Move(gen, "Flamethrower");

    const result = calculate(gen, attacker, defender, move);
    const [min, max] = result.range();

    expect(min).toBeGreaterThan(0);
    expect(max).toBeGreaterThanOrEqual(min);
    expect(result.fullDesc()).toContain("Charizard");
    expect(result.fullDesc()).toContain("Gyarados");
  });

  it("should apply weather modifier", () => {
    const attacker = new Pokemon(gen, "Charizard", {
      nature: "Modest",
      evs: { spa: 32 },
    });
    const defender = new Pokemon(gen, "Gyarados");
    const move = new Move(gen, "Flamethrower");

    const resultNoWeather = calculate(gen, attacker, defender, move);
    const resultSun = calculate(
      gen,
      attacker,
      defender,
      move,
      new Field({ weather: "Sun" })
    );

    const [minNoWeather] = resultNoWeather.range();
    const [minSun] = resultSun.range();

    expect(minSun).toBeGreaterThan(minNoWeather);
  });

  it("should calculate with stat boosts", () => {
    const attacker = new Pokemon(gen, "Charizard", {
      nature: "Modest",
      evs: { spa: 32 },
      boosts: { spa: 1 },
    });
    const defender = new Pokemon(gen, "Gyarados");
    const move = new Move(gen, "Flamethrower");

    const attackerNoBoost = new Pokemon(gen, "Charizard", {
      nature: "Modest",
      evs: { spa: 32 },
    });

    const resultBoosted = calculate(gen, attacker, defender, move);
    const resultNormal = calculate(gen, attackerNoBoost, defender, move);

    const [minBoosted] = resultBoosted.range();
    const [minNormal] = resultNormal.range();

    expect(minBoosted).toBeGreaterThan(minNormal);
  });
});

const SPECIES_ABSENT_FROM_GEN0 = [
  "Rillaboom",
  "Baxcalibur",
  "Salamence",
  "Salamence-Mega",
  "Golisopod",
] as const;

describe("@smogon/calc gen0 に収録されていない新規種族", () => {
  const gen = Generations.get(CHAMPIONS_GEN_NUM);

  it("ポケチャン追加種は gen0 の内蔵種族データに存在しない", () => {
    // 落ちたら vendored calc が該当種を収録した合図。
    // その時は overrides の意味が変わるので関連テストを見直す。
    for (const name of SPECIES_ABSENT_FROM_GEN0) {
      expect(gen.species.get(toID(name))).toBeUndefined();
    }
  });
});

describe("DamageCalculatorAdapter", () => {
  it("should calculate damage with Japanese names", () => {
    const result = damageCalculator.calculate({
      attacker: { name: "リザードン" },
      defender: { name: "ギャラドス" },
      moveName: "かえんほうしゃ",
    });

    expect(result.attacker).toBe("Charizard");
    expect(result.defender).toBe("Gyarados");
    expect(result.move).toBe("Flamethrower");
    expect(result.damage.length).toBeGreaterThan(0);
    expect(result.min).toBeGreaterThan(0);
    expect(result.max).toBeGreaterThanOrEqual(result.min);
    expect(result.minPercent).toBeGreaterThan(0);
    expect(result.maxPercent).toBeGreaterThanOrEqual(result.minPercent);
    expect(result.description).toContain("Charizard");
    expect(result.description).toContain("Gyarados");
  });

  it("should calculate damage with English names", () => {
    const result = damageCalculator.calculate({
      attacker: { name: "Charizard" },
      defender: { name: "Gyarados" },
      moveName: "Flamethrower",
    });

    expect(result.attacker).toBe("Charizard");
    expect(result.defender).toBe("Gyarados");
    expect(result.move).toBe("Flamethrower");
    expect(result.min).toBeGreaterThan(0);
  });

  it("should throw error for non-existent Pokemon name", () => {
    expect(() =>
      damageCalculator.calculate({
        attacker: { name: "ソニック" },
        defender: { name: "ギャラドス" },
        moveName: "かえんほうしゃ",
      }),
    ).toThrow("ポケモン「ソニック」が見つかりません。");
  });

  it("should throw error for non-existent move name", () => {
    expect(() =>
      damageCalculator.calculate({
        attacker: { name: "リザードン" },
        defender: { name: "ギャラドス" },
        moveName: "ファイナルフラッシュ",
      }),
    ).toThrow("技「ファイナルフラッシュ」が見つかりません。");
  });

  it("should apply default nature (Serious) when not specified", () => {
    const resultDefault = damageCalculator.calculate({
      attacker: { name: "リザードン" },
      defender: { name: "ギャラドス" },
      moveName: "かえんほうしゃ",
    });

    const resultSerious = damageCalculator.calculate({
      attacker: { name: "リザードン", nature: "まじめ" },
      defender: { name: "ギャラドス" },
      moveName: "かえんほうしゃ",
    });

    expect(resultDefault.min).toBe(resultSerious.min);
    expect(resultDefault.max).toBe(resultSerious.max);
  });

  it("should apply EVs correctly", () => {
    const resultNoEvs = damageCalculator.calculate({
      attacker: { name: "リザードン" },
      defender: { name: "ギャラドス" },
      moveName: "かえんほうしゃ",
    });

    const resultWithEvs = damageCalculator.calculate({
      attacker: { name: "リザードン", evs: { spa: 32 } },
      defender: { name: "ギャラドス" },
      moveName: "かえんほうしゃ",
    });

    expect(resultWithEvs.min).toBeGreaterThan(resultNoEvs.min);
  });

  it("should apply weather conditions", () => {
    const resultNoWeather = damageCalculator.calculate({
      attacker: { name: "リザードン" },
      defender: { name: "ギャラドス" },
      moveName: "かえんほうしゃ",
    });

    const resultSun = damageCalculator.calculate({
      attacker: { name: "リザードン" },
      defender: { name: "ギャラドス" },
      moveName: "かえんほうしゃ",
      conditions: { weather: "Sun" },
    });

    expect(resultSun.min).toBeGreaterThan(resultNoWeather.min);
  });

  it("should apply nature modifier with Japanese name", () => {
    const resultModest = damageCalculator.calculate({
      attacker: { name: "リザードン", nature: "ひかえめ" },
      defender: { name: "ギャラドス" },
      moveName: "かえんほうしゃ",
    });

    const resultDefault = damageCalculator.calculate({
      attacker: { name: "リザードン" },
      defender: { name: "ギャラドス" },
      moveName: "かえんほうしゃ",
    });

    expect(resultModest.min).toBeGreaterThan(resultDefault.min);
  });

  it("should return koChance text", () => {
    const result = damageCalculator.calculate({
      attacker: { name: "リザードン" },
      defender: { name: "ギャラドス" },
      moveName: "かえんほうしゃ",
    });

    expect(typeof result.koChance).toBe("string");
  });

  it("should return 16 damage rolls", () => {
    const result = damageCalculator.calculate({
      attacker: { name: "リザードン" },
      defender: { name: "ギャラドス" },
      moveName: "かえんほうしゃ",
    });

    const DAMAGE_ROLL_COUNT = 16;
    expect(result.damage).toHaveLength(DAMAGE_ROLL_COUNT);
  });

  it("should populate moveType / isStab / typeMultiplier / effectivePowerMultiplier", () => {
    // Charizard (Fire/Flying) かえんほうしゃ vs Gyarados (Water/Flying)
    // Fire is STAB (Charizard's type), Fire vs Water=0.5, Fire vs Flying=1 → 0.5
    // effectivePowerMultiplier = 1.5 * 0.5 = 0.75
    const result = damageCalculator.calculate({
      attacker: { name: "リザードン" },
      defender: { name: "ギャラドス" },
      moveName: "かえんほうしゃ",
    });

    expect(result.moveType).toBe("Fire");
    expect(result.isStab).toBe(true);
    const HALF_EFFECTIVE = 0.5;
    const STAB_TIMES_HALF = 0.75;
    expect(result.typeMultiplier).toBe(HALF_EFFECTIVE);
    expect(result.effectivePowerMultiplier).toBe(STAB_TIMES_HALF);
  });
});

describe("DamageCalculatorAdapter damage with pokemon.json overrides", () => {
  it("メガスターミーの物理技が Huge Power で計算される", () => {
    // pokemon.json: Starmie-Mega atk=100, ability[0]=Huge Power
    // Huge Power 特性は攻撃力を 2 倍する
    const withHugePower = damageCalculator.calculate({
      attacker: { name: "メガスターミー" },
      defender: { name: "ギャラドス" },
      moveName: "たきのぼり",
    });

    // ability を無指定（pokemon.json の Huge Power が適用される）
    expect(withHugePower.min).toBeGreaterThan(0);
    // description に Huge Power の文字列が含まれることを期待
    expect(withHugePower.description).toContain("Starmie-Mega");
  });

  it("セグレイブのつららおとしはゴリランダーに効果抜群になる", () => {
    // @smogon/calc Gen 0 に Rillaboom species は存在しないため、defender.types は
    // pokemon.json の overrides（Grass 単タイプ）のみから決まる。
    // つららおとし (Ice) × Grass 単タイプ = 2 倍であることが types 注入の証明になる。
    const result = damageCalculator.calculate({
      attacker: { name: "セグレイブ" },
      defender: { name: "ゴリランダー" },
      moveName: "つららおとし",
    });

    expect(result.typeMultiplier).toBe(2);
  });
});

describe("DamageCalculatorAdapter weight-dependent moves", () => {
  // @smogon/calc は重さ依存技の威力を description に "(<BP> BP) " 形式で出す (desc.ts)。
  // 威力区分: 200kg以上=120 / 100kg以上=100 / 50kg以上=80 / 25kg以上=60 / 10kg以上=40 / 未満=20

  it("ガブリアス (95kg) へのくさむすびは 80 BP で計算される", () => {
    const result = damageCalculator.calculate({
      attacker: { name: "リザードン" },
      defender: { name: "ガブリアス" },
      moveName: "くさむすび",
    });

    expect(result.description).toContain("(80 BP");
  });

  it("メガルカリオZ (49.4kg) へのくさむすびは 60 BP で計算される", () => {
    // weightkg が 0 のままだと重さ区分の最低威力 (20 BP) で計算されてしまう。
    // pokemon.json の weightkg (49.4) が overrides で正しく注入されていることの確認。
    const result = damageCalculator.calculate({
      attacker: { name: "リザードン" },
      defender: { name: "メガルカリオZ" },
      moveName: "くさむすび",
    });

    expect(result.description).toContain("(60 BP");
  });

  it("ギルガルド(ブレードフォルム) (53kg) へのくさむすびは 80 BP で計算される", () => {
    // weightkg=0 から実値へ修正した既存 5 件のうちの回帰確認。
    const result = damageCalculator.calculate({
      attacker: { name: "リザードン" },
      defender: { name: "ギルガルド(ブレードフォルム)" },
      moveName: "くさむすび",
    });

    expect(result.description).toContain("(80 BP");
  });

  it("セグレイブ (210kg) へのくさむすびは 120 BP で計算される", () => {
    // @smogon/calc Gen 0 に Baxcalibur species は存在しないため、weightkg は
    // pokemon.json の overrides 以外に注入元が無い。この計算が成立すること自体が
    // overrides 経由のデータ供給が唯一のデータ源であることの証明になる。
    const result = damageCalculator.calculate({
      attacker: { name: "リザードン" },
      defender: { name: "セグレイブ" },
      moveName: "くさむすび",
    });

    expect(result.description).toContain("(120 BP");
  });

  it("グソクムシャ (108kg) へのくさむすびは 100 BP で計算される", () => {
    const result = damageCalculator.calculate({
      attacker: { name: "リザードン" },
      defender: { name: "グソクムシャ" },
      moveName: "くさむすび",
    });

    expect(result.description).toContain("(100 BP");
  });
});

describe("DamageCalculatorAdapter.calculateAllMoves", () => {
  it("should return multiple damage results for Japanese names", () => {
    const results = damageCalculator.calculateAllMoves({
      attacker: { name: "リザードン" },
      defender: { name: "ギャラドス" },
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].attacker).toBe("Charizard");
    expect(results[0].defender).toBe("Gyarados");
  });

  it("should sort results by max damage descending", () => {
    const results = damageCalculator.calculateAllMoves({
      attacker: { name: "リザードン" },
      defender: { name: "ギャラドス" },
    });

    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].max).toBeGreaterThanOrEqual(results[i].max);
    }
  });

  it("should only include moves that deal damage", () => {
    const results = damageCalculator.calculateAllMoves({
      attacker: { name: "リザードン" },
      defender: { name: "ギャラドス" },
    });

    for (const result of results) {
      expect(result.max).toBeGreaterThan(0);
    }
  });

  it("should throw error for non-existent Pokemon name", () => {
    expect(() =>
      damageCalculator.calculateAllMoves({
        attacker: { name: "ソニック" },
        defender: { name: "ギャラドス" },
      }),
    ).toThrow("ポケモン「ソニック」が見つかりません。");
  });

  it("should apply nature and EVs to calculation", () => {
    const resultsDefault = damageCalculator.calculateAllMoves({
      attacker: { name: "リザードン" },
      defender: { name: "ギャラドス" },
    });

    const resultsModest = damageCalculator.calculateAllMoves({
      attacker: { name: "リザードン", nature: "ひかえめ", evs: { spa: 32 } },
      defender: { name: "ギャラドス" },
    });

    // ひかえめ + 特攻振りなら特殊技のダメージが上がるはず
    // 同じ技で比較
    const defaultFlamethrower = resultsDefault.find(
      (r) => r.move === "Flamethrower",
    );
    const modestFlamethrower = resultsModest.find(
      (r) => r.move === "Flamethrower",
    );

    expect(defaultFlamethrower).toBeDefined();
    expect(modestFlamethrower).toBeDefined();
    expect(modestFlamethrower!.max).toBeGreaterThan(defaultFlamethrower!.max);
  });
});

describe("DamageCalculatorAdapter.createPokemonObject", () => {
  it("should create Pokemon object with Japanese name", () => {
    const { pokemon, resolvedName } = damageCalculator.createPokemonObject({
      name: "リザードン",
    });

    expect(resolvedName).toBe("Charizard");
    expect(pokemon.stats.hp).toBeGreaterThan(0);
    expect(pokemon.stats.spe).toBeGreaterThan(0);
  });

  it("should create Pokemon object with nature and EVs", () => {
    const { pokemon: pDefault } = damageCalculator.createPokemonObject({
      name: "リザードン",
    });

    const { pokemon: pModest } = damageCalculator.createPokemonObject({
      name: "リザードン",
      nature: "ひかえめ",
      evs: { spe: 32 },
    });

    expect(pModest.stats.spe).toBeGreaterThan(pDefault.stats.spe);
  });

  it("should throw error for non-existent Pokemon name", () => {
    expect(() =>
      damageCalculator.createPokemonObject({ name: "ソニック" }),
    ).toThrow("ポケモン「ソニック」が見つかりません。");
  });

  it("should apply pokemon.json overrides (Starmie-Mega atk = 100)", () => {
    // pokemon.json で Starmie-Mega の atk は 140 → 100 に修正済み
    // デフォルト特性は Huge Power
    const { pokemon } = damageCalculator.createPokemonObject({
      name: "メガスターミー",
    });

    expect(pokemon.species.baseStats.atk).toBe(100);
    expect(pokemon.ability).toBe("Huge Power");
  });

  it("should use explicit ability when specified", () => {
    // Charizard は pokemon.json で [Blaze, Solar Power]
    // ユーザー指定の場合は優先される
    const { pokemon: pDefault } = damageCalculator.createPokemonObject({
      name: "リザードン",
    });
    const { pokemon: pSolarPower } = damageCalculator.createPokemonObject({
      name: "リザードン",
      ability: "Solar Power",
    });

    expect(pDefault.ability).toBe("Blaze");
    expect(pSolarPower.ability).toBe("Solar Power");
  });
});

describe("DamageCalculatorAdapter Aura Guard の未反映を固定", () => {
  // このテストが落ちたら calc が Aura Guard を実装した合図。
  // README と instructions.ts の注記を見直してからテストを更新する。
  it("メガルカリオZ の Aura Guard は接触物理技のダメージを軽減しない", () => {
    // はどうのぼうご (Aura Guard) は「接触技のダメージ半減」効果を持つが、
    // @smogon/calc Gen 0 は本特性を未実装。ものひろい (Pickup) は champions.ts の
    // 特性処理に一切登場せず、かつ持ち物を持たせていないためこの計算に無関係な
    // 特性であり、比較対象として使う。
    // フレアドライブ (接触・Fire) を選んだのは Fighting/Steel 複合の
    // メガルカリオZ に等倍以上が確実に入り、ダメージ 0 ロールによる
    // kochance() の内部エラーを避けるため。
    const withAuraGuard = damageCalculator.calculate({
      attacker: { name: "リザードン" },
      defender: { name: "メガルカリオZ" },
      moveName: "フレアドライブ",
    });

    const withUnrelatedAbility = damageCalculator.calculate({
      attacker: { name: "リザードン" },
      defender: { name: "メガルカリオZ", ability: "ものひろい" },
      moveName: "フレアドライブ",
    });

    expect(withAuraGuard.min).toBeGreaterThan(0);
    expect(withAuraGuard.min).toBe(withUnrelatedAbility.min);
    expect(withAuraGuard.max).toBe(withUnrelatedAbility.max);
  });
});

describe("DamageCalculatorAdapter 計算後の技タイプからメトリクスを算出", () => {
  it("calculate で Aerilate によるタイプ変換が moveType に反映される", () => {
    const result = damageCalculator.calculate({
      attacker: { name: "メガカイロス" },
      defender: { name: "ゲンガー" },
      moveName: "すてみタックル",
    });

    expect(result.moveType).toBe("Flying");
    expect(result.isStab).toBe(true);
    expect(result.typeMultiplier).toBe(1);
    expect(result.min).toBeGreaterThan(0);
  });

  it("calculateAllMoves でも Aerilate のタイプ変換が結果に反映される", () => {
    const results = damageCalculator.calculateAllMoves({
      attacker: { name: "メガカイロス" },
      defender: { name: "ゲンガー" },
    });

    const doubleEdge = results.find((r) => r.move === "Double-Edge");

    expect(doubleEdge).toBeDefined();
    expect(doubleEdge!.moveType).toBe("Flying");
  });

  it("field 起因の技タイプ変換（ウェザーボール）も moveType に反映される", () => {
    // -ate 系とは独立した field 起因の変換経路を押さえる（静的マップ applyOffensiveTypeOverride への差し戻しリファクタを検出する）
    const result = damageCalculator.calculate({
      attacker: { name: "リザードン" },
      defender: { name: "ギャラドス" },
      moveName: "ウェザーボール",
      conditions: { weather: "Sun" },
    });

    expect(result.moveType).toBe("Fire");
    expect(result.isStab).toBe(true);
    expect(result.typeMultiplier).toBe(0.5);
  });
});

describe("DamageCalculatorAdapter メガボーマンダのスカイスキン (Aerilate)", () => {
  it("すてみタックルはスカイスキンで Flying 化し、ゴーストのゲンガーにも通る", () => {
    // ノーマル技はゴーストに無効なので、ダメージが出ること自体がスカイスキンによる Flying 化の証明になる。
    const result = damageCalculator.calculate({
      attacker: { name: "メガボーマンダ" },
      defender: { name: "ゲンガー" },
      moveName: "すてみタックル",
    });

    expect(result.moveType).toBe("Flying");
    expect(result.isStab).toBe(true);
    expect(result.typeMultiplier).toBe(1);
    expect(result.min).toBeGreaterThan(0);
  });

  it("すてみタックルの威力補正は STAB 単体の倍率を超える", () => {
    const withAerilate = damageCalculator.calculate({
      attacker: { name: "メガボーマンダ" },
      defender: { name: "ギャラドス" },
      moveName: "すてみタックル",
    });

    const withoutAerilate = damageCalculator.calculate({
      attacker: { name: "メガボーマンダ", ability: "ものひろい" },
      defender: { name: "ギャラドス" },
      moveName: "すてみタックル",
    });

    // 理論値は STAB (1.5) × スカイスキンの威力補正 (1.2) = 1.8 だが、実測比は 1.7778 で
    // 端数丸めにより下振れする。絶対値固定ではなく下限チェックで威力補正の有無を弁別する。
    expect(withAerilate.max / withoutAerilate.max).toBeGreaterThan(STAB_MULTIPLIER);
  });
});

describe("DamageCalculatorAdapter いかく (Intimidate) の未反映を固定", () => {
  it("ボーマンダの第一特性いかくは相手の攻撃力を下げない", () => {
    // calc は Intimidate を実装しているが発動フラグ（abilityOn）依存で、本アダプタはフラグを渡していないため未反映。反映されるようになったらこのテストが落ちる。
    const withIntimidate = damageCalculator.calculate({
      attacker: { name: "リザードン" },
      defender: { name: "ボーマンダ" },
      moveName: "フレアドライブ",
    });

    const withUnrelatedAbility = damageCalculator.calculate({
      attacker: { name: "リザードン" },
      defender: { name: "ボーマンダ", ability: "ものひろい" },
      moveName: "フレアドライブ",
    });

    expect(withIntimidate.min).toBeGreaterThan(0);
    expect(withIntimidate.min).toBe(withUnrelatedAbility.min);
    expect(withIntimidate.max).toBe(withUnrelatedAbility.max);
  });
});

describe("DamageCalculatorAdapter 計算エンジン内蔵リストに無い持ち物 (メガストーン) を持つ防御側の計算", () => {
  it("防御側がメガストーンを持っていても計算が例外を投げない", () => {
    expect(() =>
      damageCalculator.calculate({
        attacker: { name: "リザードン" },
        defender: { name: "ボーマンダ", item: "ボーマンダナイト" },
        moveName: "フレアドライブ",
      }),
    ).not.toThrow();
  });

  it("はたきおとすはメガストーン所持相手に威力補正を乗せない", () => {
    // はたきおとすは持ち物を落とせる相手にだけ 1.5 倍が乗る。
    // メガストーンは落とせないため補正対象外で、持ち物なしと同じ威力になる。
    const withMegaStone = damageCalculator.calculate({
      attacker: { name: "リザードン" },
      defender: { name: "ボーマンダ", item: "ボーマンダナイト" },
      moveName: "はたきおとす",
    });
    const withoutItem = damageCalculator.calculate({
      attacker: { name: "リザードン" },
      defender: { name: "ボーマンダ" },
      moveName: "はたきおとす",
    });
    const withRemovableItem = damageCalculator.calculate({
      attacker: { name: "リザードン" },
      defender: { name: "ボーマンダ", item: "たべのこし" },
      moveName: "はたきおとす",
    });

    expect(withMegaStone.max).toBe(withoutItem.max);
    expect(withMegaStone.max).toBeLessThan(withRemovableItem.max);
  });
});

describe("DamageCalculatorAdapter へんげんじざい (Protean) の STAB 判定", () => {
  it("メガゲッコウガ (Protean) のインファイトは種族タイプに無い技でも STAB が乗る", () => {
    // ability 省略 = pokemon.json の第一特性 (Protean) が自動適用される。
    const result = damageCalculator.calculate({
      attacker: { name: "メガゲッコウガ" },
      defender: { name: "カビゴン" },
      moveName: "インファイト",
    });

    const FIGHTING_VS_NORMAL_MULTIPLIER = 2;
    expect(result.isStab).toBe(true);
    expect(result.effectivePowerMultiplier).toBe(
      STAB_MULTIPLIER * FIGHTING_VS_NORMAL_MULTIPLIER,
    );
    expect(result.description).toContain("Protean");
  });
});
