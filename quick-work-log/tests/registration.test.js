import test from "node:test";
import assert from "node:assert/strict";
import { classifyApiError } from "../src/modules/errors.js";
import { createRegistrationGate, isSafeToRetry } from "../src/modules/registration.js";

test("登録ゲートは同時に一件だけ開始する", () => {
  const gate = createRegistrationGate();
  assert.equal(gate.begin(), true); assert.equal(gate.begin(), false); assert.equal(gate.isActive(), true);
  gate.finish(); assert.equal(gate.begin(), true);
});
test("結果不明は確認なしに再試行可能としない", () => {
  assert.equal(isSafeToRetry({ kind: "unknown" }), false);
  assert.equal(isSafeToRetry({ kind: "failure", confirmedNotCreated: false }), false);
  assert.equal(isSafeToRetry({ kind: "failure", confirmedNotCreated: true }), true);
});
test("HTTP状態を利用者向けエラーへ分類する", () => {
  assert.equal(classifyApiError({ status: 401 }).id, "ERR-AUTH");
  assert.equal(classifyApiError({ status: 404 }).id, "ERR-CALENDAR");
  assert.equal(classifyApiError({ status: 429 }).id, "ERR-RATE");
  assert.equal(classifyApiError({ status: 503 }).retry, true);
});
