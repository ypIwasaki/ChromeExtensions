import { createAuth } from "../modules/auth.js";
import { createCalendarApi } from "../modules/calendar-api.js";

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
