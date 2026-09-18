import { validateWorkLog } from "../modules/validation.js";
import { buildCalendarEvent } from "../modules/calendar-api.js";

const form = document.querySelector("#work-log-form");
const message = document.querySelector("#message");
const today = new Date().toISOString().slice(0, 10);
for (const field of ["startDate", "endDate"]) document.querySelector(`#${field}`).value = today;

loadCalendarData();

function loadCalendarData() {
  chrome.runtime.sendMessage({ type: "load-calendar-data" }, (result) => {
    if (chrome.runtime.lastError || !result?.ok) {
      message.textContent = result?.message ?? "カレンダーを読み込めません。再認証してください。";
      return;
    }
    const select = document.querySelector("#calendarId");
    for (const calendar of result.calendars) {
      const option = document.createElement("option");
      option.value = calendar.id;
      option.textContent = calendar.name;
      select.append(option);
    }
    message.textContent = "カレンダーを読み込みました。";
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = Object.fromEntries(new FormData(form));
  const errors = validateWorkLog(input);
  document.querySelectorAll(".error").forEach((node) => node.remove());
  if (Object.keys(errors).length > 0) {
    message.textContent = "入力内容を確認してください。";
    message.className = "error";
    for (const [field, text] of Object.entries(errors)) {
      const element = document.querySelector(`#${field}`);
      if (!element) continue;
      const error = document.createElement("p");
      error.className = "error";
      error.textContent = text;
      element.insertAdjacentElement("afterend", error);
    }
    return;
  }
  message.textContent = "登録しています…";
  message.className = "";
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  chrome.runtime.sendMessage({ type: "register-work-log", input, event: buildCalendarEvent(input, timeZone, { colorId: "0" }) }, (result) => {
    message.textContent = result?.ok ? "登録しました。" : (result?.message ?? "登録に失敗しました。");
  });
});

document.querySelector("#summary").focus();
