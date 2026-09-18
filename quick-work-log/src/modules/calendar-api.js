const API_ROOT = "https://www.googleapis.com/calendar/v3";

export function createCalendarApi(fetchImpl = globalThis.fetch) {
  async function request(path, token, options = {}) {
    const response = await fetchImpl(`${API_ROOT}${path}`, { ...options, headers: { Authorization: `Bearer ${token}`, ...(options.headers ?? {}) } });
    if (!response.ok) { const error = new Error(`Calendar API request failed: ${response.status}`); error.status = response.status; throw error; }
    return response.json();
  }

  return {
    async listWritableCalendars(token) {
      const items = [];
      let pageToken = "";
      do {
        const query = new URLSearchParams({ minAccessRole: "writer", showDeleted: "false", showHidden: "false" });
        if (pageToken) query.set("pageToken", pageToken);
        const page = await request(`/users/me/calendarList?${query}`, token);
        items.push(...(page.items ?? []).filter((item) => ["owner", "writer", "writerWithoutPrivateAccess"].includes(item.accessRole)));
        pageToken = page.nextPageToken ?? "";
      } while (pageToken);
      return items.map(({ id, summary }) => ({ id, name: summary ?? id })).sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }) || a.id.localeCompare(b.id));
    },
    async listEventColors(token) {
      const data = await request("/colors", token);
      return Object.entries(data.event ?? {}).map(([id, value]) => ({ id, backgroundColor: value.background, foregroundColor: value.foreground }));
    }
  };
}
