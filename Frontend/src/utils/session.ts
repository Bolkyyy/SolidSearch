export const session = {
  save: (userId: number, fullName: string, remember: boolean) => {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("userId", String(userId));
    storage.setItem("userFullName", fullName);
    if (!remember) {
      localStorage.removeItem("userId");
      localStorage.removeItem("userFullName");
    }
  },

  getUserId: (): string | null =>
    localStorage.getItem("userId") ?? sessionStorage.getItem("userId"),

  getFullName: (): string | null =>
    localStorage.getItem("userFullName") ?? sessionStorage.getItem("userFullName"),

  clear: () => {
    ["userId", "userFullName"].forEach(k => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
  },
};
