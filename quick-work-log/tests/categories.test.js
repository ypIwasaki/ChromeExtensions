import test from "node:test";
import assert from "node:assert/strict";
import { addCategory, hasDuplicateCategoryName, normalizeCategoryName, removeCategory, updateCategory } from "../src/modules/categories.js";

test("カテゴリ名は前後空白を除去して返す", () => assert.equal(normalizeCategoryName("  開発  "), "開発"));
test("空カテゴリ名を拒否する", () => assert.throws(() => normalizeCategoryName("   "), /カテゴリ名/));
test("大文字小文字を区別せず重複を検出する", () => assert.equal(hasDuplicateCategoryName([{ id: "1", name: "Dev" }], " dev "), true));
test("編集中の自分自身は重複扱いしない", () => assert.equal(hasDuplicateCategoryName([{ id: "1", name: "Dev" }], "Dev", "1"), false));
test("カテゴリを追加して正規化した名前と日時を保存する", () => {
  const result = addCategory([], { id: "1", name: " 開発 ", colorId: "1", now: "2026-09-18T00:00:00Z" });
  assert.deepEqual(result[0], { id: "1", name: "開発", colorId: "1", createdAt: "2026-09-18T00:00:00Z", updatedAt: "2026-09-18T00:00:00Z" });
});
test("カテゴリを更新・削除する", () => {
  const original = [{ id: "1", name: "開発", colorId: "1", createdAt: "a", updatedAt: "a" }];
  const updated = updateCategory(original, "1", { name: "設計", colorId: "2", now: "b" });
  assert.equal(updated[0].name, "設計");
  assert.deepEqual(removeCategory(updated, "1"), []);
});
