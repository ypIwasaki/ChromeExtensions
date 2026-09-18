import { createAuth } from "../modules/auth.js";
import { createCalendarApi } from "../modules/calendar-api.js";
import { createRegistrationGate } from "../modules/registration.js";
import { createStorage } from "../modules/storage.js";

const registrationGate = createRegistrationGate();

chrome.runtime.onInstalled.addListener(() => {});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== "load-calendar-data") return false;
  (async () => {
    try {
      const auth = createAuth();
      const api = createCalendarApi();
      const token = await auth.getToken(false);
      const [calendars, colors] = await Promise.all([api.listWritableCalendars(token), api.listEventColors(token)]);
      sendResponse({ ok: true, calendars, colors });
    } catch (error) {
      sendResponse({ ok: false, message: error.message });
    }
  })();
  return true;
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== "register-work-log") return false;
  if (!registrationGate.begin()) { sendResponse({ ok: false, code: "IN_PROGRESS", message: "登録しています。" }); return false; }
  (async () => {
    try {
      const auth = createAuth(); const api = createCalendarApi(); const storage = createStorage();
      const data = await storage.load();
      const category = data.categories.find(({ id }) => id === message.input.categoryId);
      if (!category) throw new Error("作業カテゴリを選び直してください。");
      const token = await auth.getToken(false);
      const event = { ...message.event, colorId: category.colorId };
      await api.insertEvent(token, message.input.calendarId, event);
      await storage.save({ ...data, settings: { lastCalendarId: message.input.calendarId, lastLocation: message.input.location ?? "" } });
      sendResponse({ ok: true });
    } catch (error) { sendResponse({ ok: false, message: error.message }); }
    finally { registrationGate.finish(); }
  })();
  return true;
});
