import test from "node:test";
import assert from "node:assert/strict";
import { buildCalendarEvent, createCalendarApi } from "../src/modules/calendar-api.js";

test("予定入力をCalendar APIイベントへ変換する", () => {
  const event = buildCalendarEvent({ summary: " 作業 ", startDate: "2026-09-18", startTime: "10:00", endDate: "2026-09-18", endTime: "11:00", description: "メモ", location: "東京" }, "Asia/Tokyo", { colorId: "5" });
  assert.equal(event.summary, "作業"); assert.equal(event.description, "メモ"); assert.equal(event.location, "東京"); assert.equal(event.colorId, "5"); assert.equal(event.start.timeZone, "Asia/Tokyo"); assert.equal(event.eventType, "default");
});
test("任意項目が空欄ならイベントから省略する", () => {
  const event = buildCalendarEvent({ summary: "作業", startDate: "2026-09-18", startTime: "10:00", endDate: "2026-09-18", endTime: "11:00", description: "", location: "" }, "Asia/Tokyo", { colorId: "1" });
  assert.equal("description" in event, false); assert.equal("location" in event, false);
});
test("予定登録はカレンダーIDをURLエンコードしてPOSTする", async () => {
  let request; const api = createCalendarApi(async (url, options) => { request = { url, options }; return { ok: true, status: 200, json: async () => ({ id: "event-1" }) }; });
  const result = await api.insertEvent("token", "user/test", { summary: "作業" });
  assert.equal(result.id, "event-1"); assert.match(request.url, /calendars\/user%2Ftest\/events$/); assert.equal(request.options.method, "POST"); assert.equal(request.options.headers["Content-Type"], "application/json");
});
