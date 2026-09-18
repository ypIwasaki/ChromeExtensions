export function validateWorkLog(input, { calendars = [], categories = [] } = {}) {
  const errors = {};
  if (!String(input.summary ?? "").trim()) errors.summary = "作業名を入力してください。";
  const labels = { startDate: "開始日", startTime: "開始時刻", endDate: "終了日", endTime: "終了時刻" };
  for (const field of Object.keys(labels)) {
    if (!input[field] || !isValidPart(field, input[field])) errors[field] = `${labels[field]}を入力してください。`;
  }
  const start = combineLocalDateTime(input.startDate, input.startTime);
  const end = combineLocalDateTime(input.endDate, input.endTime);
  if (start && end && end <= start) errors.datetime = "終了日時は開始日時より後にしてください。";
  if (!calendars.some(({ id }) => id === input.calendarId)) errors.calendarId = "登録先カレンダーを選択してください。";
  if (!categories.some(({ id }) => id === input.categoryId)) errors.categoryId = "作業カテゴリを選択してください。";
  return errors;
}

function combineLocalDateTime(date, time) {
  if (!date || !time) return null;
  const value = new Date(`${date}T${time}`);
  if (Number.isNaN(value.getTime())) return null;
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return value.getFullYear() === year && value.getMonth() + 1 === month && value.getDate() === day && value.getHours() === hour && value.getMinutes() === minute ? value : null;
}

function isValidPart(field, value) {
  if (field.endsWith("Date")) return /^\d{4}-\d{2}-\d{2}$/.test(value) && combineLocalDateTime(value, "00:00") !== null;
  return /^\d{2}:\d{2}$/.test(value) && Number(value.slice(0, 2)) < 24 && Number(value.slice(3)) < 60;
}
