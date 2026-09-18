export function normalizeCategoryName(name) {
  const normalized = String(name ?? "").trim();
  if (!normalized) throw new Error("カテゴリ名を入力してください。");
  return normalized;
}

export function hasDuplicateCategoryName(categories, name, excludedId = null) {
  const key = normalizeCategoryName(name).toLocaleLowerCase();
  return categories.some((category) => category.id !== excludedId && category.name.trim().toLocaleLowerCase() === key);
}

export function addCategory(categories, { id, name, colorId, now = new Date().toISOString() }) {
  const normalizedName = normalizeCategoryName(name);
  if (hasDuplicateCategoryName(categories, normalizedName)) throw new Error("同名のカテゴリがあります。");
  return [...categories, { id, name: normalizedName, colorId, createdAt: now, updatedAt: now }];
}

export function updateCategory(categories, id, { name, colorId, now = new Date().toISOString() }) {
  const current = categories.find((category) => category.id === id);
  if (!current) throw new Error("カテゴリが見つかりません。");
  const normalizedName = normalizeCategoryName(name);
  if (hasDuplicateCategoryName(categories, normalizedName, id)) throw new Error("同名のカテゴリがあります。");
  return categories.map((category) => category.id === id ? { ...category, name: normalizedName, colorId, updatedAt: now } : category);
}

export function removeCategory(categories, id) {
  return categories.filter((category) => category.id !== id);
}
