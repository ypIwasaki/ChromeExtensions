export function createAuth(identity = globalThis.chrome?.identity) {
  if (!identity) throw new Error("chrome.identityが利用できません。");
  return {
    async getToken(interactive = false) {
      try {
        const { token } = await identity.getAuthToken({ interactive });
        if (!token) throw new Error("認証が必要です。");
        return token;
      } catch (error) {
        throw new Error(interactive ? "認証に失敗しました。" : "認証が必要です。", { cause: error });
      }
    },
    async removeToken(token) { await identity.removeCachedAuthToken({ token }); }
  };
}
