export function normalizeCategoryName(name) {
  const normalized = String(name ?? "").trim();
  if (!normalized) throw new Error("カテゴリ名を入力してください。");
  return normalized;
}

export function hasDuplicateCategoryName(categories, name, excludedId = null) {
  const key = normalizeCategoryName(name).toLocaleLowerCase();
  return categories.some((category) => category.id !== excludedId && category.name.trim().toLocaleLowerCase() === key);
}
