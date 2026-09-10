import { Generations } from "@smogon/calc";
import type { Generation, Item, Items } from "@smogon/calc/dist/data/interface";
import type { CalcItemProvider } from "../types/item.js";

export const CHAMPIONS_GEN_NUM = 0;

/**
 * calc 内蔵の持ち物リストが不完全で、防御側の持ち物を非 null 前提で引く箇所が
 * あるため（gen0 の calculateBPModsChampions は `gen.items.get(...)` の結果を
 * 無条件に `.megaStone` 参照し、内蔵に無い持ち物だと TypeError で計算全体が
 * 落ちる）、欠落分を items.json からスタブ供給する。
 */
function toFallbackItem(
  id: string,
  provider: CalcItemProvider,
): Item | undefined {
  const entry = provider.getById(id);
  if (entry === undefined) return undefined;

  // calc の ItemName / SpeciesName はブランド付き文字列型で、
  // items.json 由来のプレーンな string からは代入できない。
  return {
    kind: "Item",
    id,
    name: entry.name,
    megaStone: entry.megaStone ?? undefined,
  } as Item;
}

function withFallbackItems(items: Items, provider: CalcItemProvider): Items {
  return {
    get: (id) => items.get(id) ?? toFallbackItem(id, provider),
    [Symbol.iterator]: () => items[Symbol.iterator](),
  };
}

/**
 * Champions 世代 (gen0) の Generation を、持ち物の欠落を itemProvider で
 * 補ったうえで返す。
 */
export function createChampionsGen(itemProvider: CalcItemProvider): Generation {
  const { num, abilities, items, moves, species, types, natures } =
    Generations.get(CHAMPIONS_GEN_NUM);
  return {
    num,
    abilities,
    items: withFallbackItems(items, itemProvider),
    moves,
    species,
    types,
    natures,
  };
}
