import { defineStore } from "pinia";
import type { UserInfo } from "~/utils/model";

export const useUserStore = defineStore("user", () => {
  const user = ref<UserInfo | null>(null);

  /** 解析后的角色列表（来自 user.roles，逗号分隔） */
  const roles = computed(() => {
    const r = user.value?.roles;
    if (!r || typeof r !== "string") return [];
    return r
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  });

  const isAdmin = computed(() => roles.value.includes("admin"));

  function setUser(info: UserInfo | null) {
    user.value = info;
  }

  function clearUser() {
    user.value = null;
  }

  async function fetchUser(): Promise<UserInfo | null> {
    try {
      // Authorization 使用 httpOnly Cookie，客户端无法读取；直接让服务端从 Cookie 校验
      const res = await $fetch<{ c: number; d: UserInfo | null; m?: string }>(
        "/api/entry/user/info",
        {
          method: "get",
          headers: import.meta.server
            ? { Authorization: useCookie("Authorization").value || "" }
            : undefined,
          credentials: "include",
        },
      );
      if (res?.c === 200 && res.d) {
        setUser(res.d);
        return res.d;
      }
      clearUser();
      return null;
    } catch {
      clearUser();
      return null;
    }
  }

  return {
    user,
    roles,
    isAdmin,
    setUser,
    clearUser,
    fetchUser,
  };
});
