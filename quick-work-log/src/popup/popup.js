import { validateWorkLog } from "../modules/validation.js";
import { buildCalendarEvent } from "../modules/calendar-api.js";
import { addCategory, removeCategory } from "../modules/categories.js";
import { createStorage } from "../modules/storage.js";

const form = document.querySelector("#work-log-form");
const message = document.querySelector("#message");
const reauthenticate = document.querySelector("#reauthenticate");
const submitButton = document.querySelector("button[type=submit]");
const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
let calendars = [];
let lastCalendarId = null;
for (const field of ["startDate", "endDate"]) document.querySelector(`#${field}`).value = today;

loadCalendarData();
loadCategories();

let categories = [];
let colors = [];

async function loadCategories() {
  try { const data = await createStorage().load(); categories = data.categories; lastCalendarId = data.settings.lastCalendarId; renderCategories(); document.querySelector("#location").value = data.settings.lastLocation ?? ""; } catch (error) { message.textContent = error.message; }
}

function renderCategories() {
  const select = document.querySelector("#categoryId");
  select.replaceChildren(new Option(categories.length ? "カテゴリを選択してください" : "カテゴリを追加してください", ""));
  for (const category of categories) select.append(new Option(category.name, category.id));
  document.querySelector("#delete-category").disabled = !select.value;
  document.querySelector("#edit-category").disabled = !select.value;
}

function loadCalendarData() {
  chrome.runtime.sendMessage({ type: "load-calendar-data", interactive: false }, (result) => {
    if (chrome.runtime.lastError || !result?.ok) {
      message.textContent = result?.message ?? "カレンダーを読み込めません。再認証してください。";
      reauthenticate.hidden = false;
      return;
    }
    reauthenticate.hidden = true;
    calendars = result.calendars;
    const select = document.querySelector("#calendarId");
    colors = result.colors;
    const colorSelect = document.querySelector("#categoryColor");
    colorSelect.replaceChildren(...colors.map((color) => new Option(color.id, color.id)));
    for (const calendar of result.calendars) {
      const option = document.createElement("option");
      option.value = calendar.id;
      option.textContent = calendar.name;
      select.append(option);
    }
    if (lastCalendarId && result.calendars.some(({ id }) => id === lastCalendarId)) select.value = lastCalendarId;
    message.textContent = "カレンダーを読み込みました。";
  });
}

reauthenticate.addEventListener("click", () => {
  reauthenticate.disabled = true;
  chrome.runtime.sendMessage({ type: "load-calendar-data", interactive: true }, (result) => {
    reauthenticate.disabled = false;
    if (!result?.ok) { message.textContent = result?.message ?? "再認証に失敗しました。"; return; }
    reauthenticate.hidden = true; calendars = result.calendars; message.textContent = "再認証しました。";
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = Object.fromEntries(new FormData(form));
  const errors = validateWorkLog(input, { calendars, categories });
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
  submitButton.disabled = true;
  document.querySelectorAll("#add-category, #edit-category, #delete-category, #reauthenticate").forEach((button) => { button.disabled = true; });
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  chrome.runtime.sendMessage({ type: "register-work-log", input, event: buildCalendarEvent(input, timeZone, { colorId: "0" }) }, (result) => {
    if (result?.ok) { message.textContent = "登録しました。"; setTimeout(() => window.close(), 700); return; }
    submitButton.disabled = false;
    document.querySelectorAll("#add-category, #edit-category, #delete-category, #reauthenticate").forEach((button) => { button.disabled = false; });
    message.textContent = result?.message ?? "登録に失敗しました。";
  });
});

document.querySelector("#categoryId").addEventListener("change", (event) => { document.querySelector("#delete-category").disabled = !event.target.value; document.querySelector("#edit-category").disabled = !event.target.value; });
document.querySelector("#add-category").addEventListener("click", () => { document.querySelector("#category-form").dataset.editing = ""; document.querySelector("#categoryName").value = ""; document.querySelector("#category-dialog").showModal(); });
document.querySelector("#edit-category").addEventListener("click", () => { const category = categories.find(({ id }) => id === document.querySelector("#categoryId").value); if (!category) return; document.querySelector("#category-form").dataset.editing = category.id; document.querySelector("#categoryName").value = category.name; document.querySelector("#categoryColor").value = category.colorId; document.querySelector("#category-dialog").showModal(); });
document.querySelector("#category-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const data = await createStorage().load();
    const form = document.querySelector("#category-form");
    const editing = form.dataset.editing;
    const updated = editing ? (await import("../modules/categories.js")).updateCategory(data.categories, editing, { name: document.querySelector("#categoryName").value, colorId: document.querySelector("#categoryColor").value }) : addCategory(data.categories, { id: crypto.randomUUID(), name: document.querySelector("#categoryName").value, colorId: document.querySelector("#categoryColor").value });
    await createStorage().save({ ...data, categories: updated });
    categories = updated; renderCategories(); document.querySelector("#category-dialog").close(); event.target.reset();
  } catch (error) { message.textContent = error.message; }
});
document.querySelector("#delete-category").addEventListener("click", async () => {
  const id = document.querySelector("#categoryId").value; if (!id || !confirm("選択中のカテゴリを削除しますか？")) return;
  const data = await createStorage().load(); const updated = removeCategory(data.categories, id); await createStorage().save({ ...data, categories: updated }); categories = updated; renderCategories();
});

document.querySelector("#summary").focus();
