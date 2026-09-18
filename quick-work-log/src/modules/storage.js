const DEFAULT_DATA = { schemaVersion: 1, categories: [], settings: { lastCalendarId: null, lastLocation: "" } };

export function createStorage(chromeStorage = globalThis.chrome?.storage?.local) {
  if (!chromeStorage) throw new Error("chrome.storage.localが利用できません。");
  return {
    async load() {
      const data = await chromeStorage.get(DEFAULT_DATA);
      if (data.schemaVersion !== 1 || !Array.isArray(data.categories) || !data.settings || typeof data.settings !== "object") {
        throw new Error("保存データを読み込めません。データを変更せず復旧してください。");
      }
      return data;
    },
    async save(data) { await chromeStorage.set(data); }
  };
}

export { DEFAULT_DATA };
