import test from "node:test";
import assert from "node:assert/strict";
import { hasDuplicateCategoryName, normalizeCategoryName } from "../src/modules/categories.js";

test("カテゴリ名は前後空白を除去して返す", () => assert.equal(normalizeCategoryName("  開発  "), "開発"));
test("空カテゴリ名を拒否する", () => assert.throws(() => normalizeCategoryName("   "), /カテゴリ名/));
test("大文字小文字を区別せず重複を検出する", () => assert.equal(hasDuplicateCategoryName([{ id: "1", name: "Dev" }], " dev "), true));
test("編集中の自分自身は重複扱いしない", () => assert.equal(hasDuplicateCategoryName([{ id: "1", name: "Dev" }], "Dev", "1"), false));
