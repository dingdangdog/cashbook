import type { Result } from "~/utils/model";
import { SystemConfig } from "~/utils/store";

export default defineNuxtPlugin({
  hooks: {
    "app:created": async () => {
      try {
        const { data: res, error } = await useFetch<Result<SystemSetting>>(
          "/api/config"
        );
        // console.log(res.value);
        if (error.value != null) {
          // console.log(error.value);
          console.error(error.value);
          return;
        }
        if (res.value && res.value.c == 200) {
          // 查询成功
          SystemConfig.value = res.value.d;
          // const nuxtApp = useNuxtApp();
          // nuxtApp.provide("system", res.value.d);
        }
      } catch (error) {
        // console.error("getUnreadNum Error", error);
      }
    },
  },
});
