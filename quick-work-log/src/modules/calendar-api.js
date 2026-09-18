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
    },
    async insertEvent(token, calendarId, event) {
      return request(`/calendars/${encodeURIComponent(calendarId)}/events`, token, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(event) });
    }
  };
}

export function buildCalendarEvent(input, timeZone, category) {
  const start = new Date(`${input.startDate}T${input.startTime}`);
  const end = new Date(`${input.endDate}T${input.endTime}`);
  const localDateTime = (value) => value.toISOString().replace(".000Z", "");
  const event = { summary: String(input.summary).trim(), start: { dateTime: localDateTime(start), timeZone }, end: { dateTime: localDateTime(end), timeZone }, colorId: String(category.colorId), eventType: "default" };
  if (input.description) event.description = input.description;
  if (input.location) event.location = input.location;
  return event;
}
