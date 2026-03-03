import type { Result } from "~/utils/model";
import type { SystemSetting } from "~/utils/table";
import { useSystemStore } from "~/utils/store";

export default defineNuxtPlugin((nuxtApp) => {
  const systemStore = useSystemStore(nuxtApp.$pinia);

  nuxtApp.hooks.hook("app:created", async () => {
    try {
      const { data: res, error } = await useFetch<Result<SystemSetting>>(
        "/api/config"
      );
      if (error.value != null) {
        console.error(error.value);
        return;
      }
      if (res.value && res.value.c == 200) {
        systemStore.setSystemConfig(res.value.d);
      }
    } catch (error) {
      console.error("load system config error", error);
    }
  });
});
