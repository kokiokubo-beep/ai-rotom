import { describe, it, expect } from "vitest";
import type { PokemonEntry } from "../../types/pokemon.js";
import type { PokemonInput } from "../types.js";
import { buildPokemonOptions } from "./pokemon-builder.js";

const mockPokemonEntry: PokemonEntry = {
  id: "lucariomegaz",
  name: "Lucario-Mega-Z",
  nameJa: "メガルカリオZ",
  types: ["Fighting", "Steel"],
  baseStats: { hp: 70, atk: 100, def: 70, spa: 164, spd: 70, spe: 151 },
  abilities: ["Aura Guard"],
  weightkg: 49.4,
  baseSpecies: "Lucario",
  otherFormes: null,
};

const baseInput: PokemonInput = { name: "Lucario-Mega-Z" };

describe("buildPokemonOptions", () => {
  describe("pokemonEntry の overrides 反映", () => {
    it("pokemonEntry がある場合、overrides に types / baseStats / weightkg が入る", () => {
      const options = buildPokemonOptions(
        baseInput,
        "Serious",
        undefined,
        undefined,
        mockPokemonEntry,
      );

      expect(options.overrides?.types).toEqual(mockPokemonEntry.types);
      expect(options.overrides?.baseStats).toEqual(mockPokemonEntry.baseStats);
      expect(options.overrides?.weightkg).toBe(mockPokemonEntry.weightkg);
    });

    it("pokemonEntry が undefined の場合 overrides を付けない", () => {
      const options = buildPokemonOptions(
        baseInput,
        "Serious",
        undefined,
        undefined,
        undefined,
      );

      expect(options.overrides).toBeUndefined();
    });
  });

  describe("ability の決定", () => {
    it("ability 未指定時に pokemonEntry.abilities[0] が採用される", () => {
      const options = buildPokemonOptions(
        baseInput,
        "Serious",
        undefined,
        undefined,
        mockPokemonEntry,
      );

      expect(options.ability).toBe("Aura Guard");
    });

    it("ability 明示指定時は pokemonEntry より指定値が優先される", () => {
      const options = buildPokemonOptions(
        baseInput,
        "Serious",
        "Justified",
        undefined,
        mockPokemonEntry,
      );

      expect(options.ability).toBe("Justified");
    });

    it("ability 未指定かつ pokemonEntry も無い場合 undefined になる", () => {
      const options = buildPokemonOptions(
        baseInput,
        "Serious",
        undefined,
        undefined,
        undefined,
      );

      expect(options.ability).toBeUndefined();
    });
  });

  describe("evs / boosts の変換", () => {
    it("evs 未指定時は空オブジェクトになる", () => {
      const options = buildPokemonOptions(
        baseInput,
        "Serious",
        undefined,
        undefined,
        undefined,
      );

      expect(options.evs).toEqual({});
    });

    it("evs 指定時はそのまま反映される", () => {
      const input: PokemonInput = { name: "Lucario-Mega-Z", evs: { spa: 32 } };

      const options = buildPokemonOptions(
        input,
        "Serious",
        undefined,
        undefined,
        undefined,
      );

      expect(options.evs).toEqual({ spa: 32 });
    });

    it("boosts 未指定時は空オブジェクトになる", () => {
      const options = buildPokemonOptions(
        baseInput,
        "Serious",
        undefined,
        undefined,
        undefined,
      );

      expect(options.boosts).toEqual({});
    });

    it("boosts 指定時はそのまま反映される", () => {
      const input: PokemonInput = {
        name: "Lucario-Mega-Z",
        boosts: { atk: 2 },
      };

      const options = buildPokemonOptions(
        input,
        "Serious",
        undefined,
        undefined,
        undefined,
      );

      expect(options.boosts).toEqual({ atk: 2 });
    });
  });

  describe("status の変換", () => {
    it("status 未指定時は空文字になる", () => {
      const options = buildPokemonOptions(
        baseInput,
        "Serious",
        undefined,
        undefined,
        undefined,
      );

      expect(options.status).toBe("");
    });

    it("status 指定時はそのまま反映される", () => {
      const input: PokemonInput = { name: "Lucario-Mega-Z", status: "brn" };

      const options = buildPokemonOptions(
        input,
        "Serious",
        undefined,
        undefined,
        undefined,
      );

      expect(options.status).toBe("brn");
    });
  });
});
