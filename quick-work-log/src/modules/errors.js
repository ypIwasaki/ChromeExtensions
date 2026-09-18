export function classifyApiError(error) {
  if (error?.status === 401) return { id: "ERR-AUTH", retry: false, message: "認証が無効です。再認証してください。" };
  if (error?.status === 403) return { id: "ERR-PERMISSION", retry: false, message: "カレンダーへの書き込み権限を確認してください。" };
  if (error?.status === 404) return { id: "ERR-CALENDAR", retry: false, message: "カレンダーを選び直してください。" };
  if (error?.status === 429) return { id: "ERR-RATE", retry: true, message: "時間を置いてから手動で再実行してください。" };
  if (error?.status >= 500) return { id: "ERR-API", retry: true, message: "時間を置いてから手動で再実行してください。" };
  if (error?.name === "TypeError" || error?.network === true) return { id: "ERR-NETWORK", retry: true, message: "接続を確認してから手動で再実行してください。" };
  return { id: "ERR-UNKNOWN", retry: false, message: "原因を特定できません。入力を保持して確認してください。" };
}
