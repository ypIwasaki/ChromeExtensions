import test from "node:test";
import assert from "node:assert/strict";
import { createCalendarApi } from "../src/modules/calendar-api.js";

function response(body, status = 200) { return { ok: status >= 200 && status < 300, status, json: async () => body }; }

test("カレンダー一覧を全ページ取得し、書き込み可能なものを名前順にする", async () => {
  const calls = [];
  const api = createCalendarApi(async (url) => { calls.push(url); return calls.length === 1 ? response({ items: [{ id: "b", summary: "beta", accessRole: "writer" }, { id: "r", summary: "read", accessRole: "reader" }], nextPageToken: "next" }) : response({ items: [{ id: "a", summary: "Alpha", accessRole: "owner" }] }); });
  assert.deepEqual(await api.listWritableCalendars("token"), [{ id: "a", name: "Alpha" }, { id: "b", name: "beta" }]);
  assert.equal(calls.length, 2);
  assert.match(calls[1], /pageToken=next/);
});

test("イベント色を表示用データへ変換する", async () => {
  const api = createCalendarApi(async () => response({ event: { "1": { background: "#fff", foreground: "#000" } } }));
  assert.deepEqual(await api.listEventColors("token"), [{ id: "1", backgroundColor: "#fff", foregroundColor: "#000" }]);
});

test("HTTPエラーにステータスを保持する", async () => {
  const api = createCalendarApi(async () => response({}, 401));
  await assert.rejects(() => api.listEventColors("token"), (error) => error.status === 401);
});
