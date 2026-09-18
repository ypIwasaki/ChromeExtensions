import { validateWorkLog } from "../modules/validation.js";

const form = document.querySelector("#work-log-form");
const message = document.querySelector("#message");
const today = new Date().toISOString().slice(0, 10);
for (const field of ["startDate", "endDate"]) document.querySelector(`#${field}`).value = today;

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
  message.textContent = "入力を受け付けました。予定登録は次の段階で追加します。";
  message.className = "";
});

document.querySelector("#summary").focus();
