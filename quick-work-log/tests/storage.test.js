import test from "node:test";
import assert from "node:assert/strict";
import { createStorage, DEFAULT_DATA } from "../src/modules/storage.js";

function adapter(initial = DEFAULT_DATA) {
  let value = structuredClone(initial);
  return { get: async (fallback) => ({ ...fallback, ...value }), set: async (next) => { value = next; } };
}

test("保存アダプターは初期データを読み書きする", async () => {
  const storage = createStorage(adapter());
  assert.deepEqual(await storage.load(), DEFAULT_DATA);
  await storage.save({ ...DEFAULT_DATA, categories: [{ id: "1" }] });
});

test("未知の保存版を上書きせず拒否する", async () => {
  await assert.rejects(() => createStorage(adapter({ ...DEFAULT_DATA, schemaVersion: 9 })).load(), /保存データ/);
});
