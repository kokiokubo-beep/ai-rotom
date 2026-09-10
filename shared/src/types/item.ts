/**
 * @smogon/calc の内蔵持ち物データに無い持ち物を補うためのプロバイダ。
 * calc の Champions 世代は内蔵の持ち物リストが不完全なため、
 * items.json 側から不足分を注入する。
 */
export interface CalcItemProvider {
  /**
   * 持ち物 ID (toID 形式) から、ダメージ計算が参照する最小情報を返す。
   * 未登録なら undefined。
   */
  getById(id: string): {
    name: string;
    /**
     * メガストーンの対応表 ({ 進化前英語名: 進化後英語名 })。
     * たたきおとすの威力補正がメガストーン所持で無効になる判定にのみ使われる。
     * メガストーンでなければ null。
     */
    megaStone: Readonly<Record<string, string>> | null;
  } | undefined;
}
