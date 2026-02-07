import type { UserInfo } from "./model";

// 全局用户信息存储
export const GlobalUserInfo = ref<UserInfo>();

export const typeRelationStore = ref<TypeRelation[]>([]);

export const SystemConfig = ref<SystemSetting>();
