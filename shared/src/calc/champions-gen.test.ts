import { describe, it, expect } from "vitest";
import { Generations, toID } from "@smogon/calc";
import type { CalcItemProvider } from "../types/item.js";
import { createChampionsGen, CHAMPIONS_GEN_NUM } from "./champions-gen.js";

const BUILTIN_ITEM_NAME = "Leftovers";

const FALLBACK_NAME = "Testronite";
const FALLBACK_ID = toID(FALLBACK_NAME);

const MEGA_STONE_NAME = "Mockmonite";
const MEGA_STONE_ID = toID(MEGA_STONE_NAME);
const MEGA_STONE_MAP = { Mockmon: "Mockmon-Mega" };

const UNKNOWN_ID = toID("Zzzznotarealitemz");

function createMockProvider(): CalcItemProvider {
  return {
    getById: (id) => {
      if (id === FALLBACK_ID) {
        return { name: FALLBACK_NAME, megaStone: null };
      }
      if (id === MEGA_STONE_ID) {
        return { name: MEGA_STONE_NAME, megaStone: MEGA_STONE_MAP };
      }
      return undefined;
    },
  };
}

describe("createChampionsGen", () => {
  it("内蔵にある id は内蔵データが返る", () => {
    const gen = createChampionsGen(createMockProvider());
    const item = gen.items.get(toID(BUILTIN_ITEM_NAME));
    expect(item?.name).toBe(BUILTIN_ITEM_NAME);
  });

  it("内蔵に無く provider にある id は provider 由来 name のスタブが返る", () => {
    const gen = createChampionsGen(createMockProvider());
    const item = gen.items.get(FALLBACK_ID);
    expect(item?.name).toBe(FALLBACK_NAME);
  });

  it("provider がメガストーン対応表を返す id では megaStone がその対応表になる", () => {
    const gen = createChampionsGen(createMockProvider());
    const item = gen.items.get(MEGA_STONE_ID);
    expect(item?.megaStone).toEqual(MEGA_STONE_MAP);
  });

  it("内蔵にも provider にも無い id は undefined が返る", () => {
    const gen = createChampionsGen(createMockProvider());
    const item = gen.items.get(UNKNOWN_ID);
    expect(item).toBeUndefined();
  });

  it("provider が非メガストーン (megaStone: null) を返す id では megaStone が undefined になる", () => {
    const gen = createChampionsGen(createMockProvider());
    const item = gen.items.get(FALLBACK_ID);
    expect(item).toBeDefined();
    expect(item?.megaStone).toBeUndefined();
  });

  it("ラッパ生成後も素の Generations.get(0) の内蔵データにスタブは書き戻されない", () => {
    createChampionsGen(createMockProvider());
    const rawItem = Generations.get(CHAMPIONS_GEN_NUM).items.get(FALLBACK_ID);
    expect(rawItem).toBeUndefined();
  });
});
