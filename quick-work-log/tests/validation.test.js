import test from "node:test";
import assert from "node:assert/strict";
import { validateWorkLog } from "../src/modules/validation.js";

const valid = { summary: "作業", startDate: "2026-09-18", startTime: "10:00", endDate: "2026-09-18", endTime: "11:00", calendarId: "cal", categoryId: "cat" };
const options = { calendars: [{ id: "cal" }], categories: [{ id: "cat" }] };

test("有効な予定入力を受け付ける", () => assert.deepEqual(validateWorkLog(valid, options), {}));
test("必須項目と終了日時を検証する", () => {
  const errors = validateWorkLog({ ...valid, summary: " ", endTime: "09:00" }, options);
  assert.equal(errors.summary, "作業名を入力してください。");
  assert.equal(errors.datetime, "終了日時は開始日時より後にしてください。");
});
test("カレンダーとカテゴリの現在の一覧を検証する", () => {
  const errors = validateWorkLog({ ...valid, calendarId: "gone", categoryId: "gone" }, options);
  assert.equal(errors.calendarId, "登録先カレンダーを選択してください。");
  assert.equal(errors.categoryId, "作業カテゴリを選択してください。");
});
test("存在しない日付と時刻を拒否する", () => {
  const errors = validateWorkLog({ ...valid, startDate: "2026-02-30", startTime: "25:00" }, options);
  assert.equal(errors.startDate, "開始日を入力してください。");
  assert.equal(errors.startTime, "開始時刻を入力してください。");
});
