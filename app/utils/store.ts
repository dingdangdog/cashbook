import { defineStore } from "pinia";
import type { UserInfo } from "./model";
import type { SystemSetting, TypeRelation } from "./table";

interface SystemState {
  globalUserInfo: UserInfo | null;
  systemConfig: SystemSetting | null;
  typeRelations: TypeRelation[];
}

export const useSystemStore = defineStore("system", {
  state: (): SystemState => ({
    globalUserInfo: null,
    systemConfig: null,
    typeRelations: [],
  }),
  getters: {
    isRegisterOpen: (state) => state.systemConfig?.openRegister ?? false,
  },
  actions: {
    setSystemConfig(config: SystemSetting | null) {
      this.systemConfig = config;
    },
    setGlobalUserInfo(user: UserInfo | null) {
      this.globalUserInfo = user;
    },
    setTypeRelations(relations: TypeRelation[]) {
      this.typeRelations = relations;
    },
  },
});
