<script setup lang="ts">
definePageMeta({
  unauthenticatedOnly: true,
});

import { SunIcon, MoonIcon } from "@heroicons/vue/24/outline";
import { SystemConfig } from "~/utils/store";
import { clearAuthStorage } from "~/utils/common";

const themeStore = useThemeStore();
const isDark = computed(() => themeStore.isDark);
const toggleTheme = () => themeStore.toggleTheme();

const loading = ref(false);
const activeTab = ref<"system" | "admin">("system");
const tabs = [
  { key: "system" as const, label: "系统信息" },
  { key: "admin" as const, label: "超管账号" },
];

const systemForm = ref({
  title: "Cashbook",
  description: "",
  keywords: "Cashbook,记账本",
  openRegister: false,
});

const adminForm = ref({
  name: "管理员",
  username: "",
  password: "",
  againPassword: "",
});

const formErrors = ref<Record<string, string>>({});

const goTab = (key: "system" | "admin") => {
  activeTab.value = key;
};

const validateAdmin = () => {
  formErrors.value = {};
  if (!adminForm.value.username) {
    formErrors.value.username = "必填";
  } else if (adminForm.value.username.length < 4) {
    formErrors.value.username = "账号至少 4 个字符";
  }
  if (!adminForm.value.password) {
    formErrors.value.password = "必填";
  } else if (adminForm.value.password.length < 8) {
    formErrors.value.password = "密码至少 8 个字符";
  }
  if (adminForm.value.againPassword !== adminForm.value.password) {
    formErrors.value.againPassword = "两次密码不一致";
  }
  return Object.keys(formErrors.value).length === 0;
};

const submit = async () => {
  if (!validateAdmin()) return;
  loading.value = true;
  try {
    await doApi.post("api/init", {
      systemConfig: {
        title: systemForm.value.title || "Cashbook",
        description: systemForm.value.description || "",
        keywords: systemForm.value.keywords || "",
        openRegister: systemForm.value.openRegister,
      },
      admin: {
        name: adminForm.value.name || "管理员",
        username: adminForm.value.username,
        password: adminForm.value.password,
      },
    });
    Alert.success("初始化成功，请使用超管账号登录");
    await nextTick();
    navigateTo("/login");
  } catch (_) {
    // 错误已由 doApi 的 intercepter 弹出
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  try {
    const count = await doApi.get<number>("api/check");
    if (count !== 0) {
      navigateTo("/login");
      return;
    }
    // 未初始化时清除前端登录态，避免残留 cookie 导致与 init 冲突、来回跳转
    clearAuthStorage();
  } catch {
    navigateTo("/login");
    return;
  }
  if (SystemConfig.value?.title) {
    systemForm.value.title = SystemConfig.value.title;
    systemForm.value.description = SystemConfig.value.description ?? "";
    systemForm.value.keywords = SystemConfig.value.keywords ?? "";
    systemForm.value.openRegister = SystemConfig.value.openRegister ?? false;
  }
});
</script>

<template>
  <Head>
    <Title>系统初始化 - {{ SystemConfig?.title || "Cashbook" }}</Title>
  </Head>

  <div
    class="min-h-screen p-2 transition-colors duration-300 bg-background text-foreground"
  >
    <div class="fixed top-2 right-2 flex items-center gap-2 z-50">
      <button
        @click="toggleTheme()"
        class="p-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg bg-surface-muted text-foreground hover:bg-surface border border-border"
        title="切换主题"
      >
        <SunIcon v-if="isDark" class="w-5 h-5" />
        <MoonIcon v-else class="w-5 h-5" />
      </button>
    </div>

    <div
      class="flex flex-col items-center justify-center min-h-screen p-4 -mt-12"
    >
      <div
        class="flex flex-col sm:flex-row items-center mb-4 text-center sm:text-left"
      >
        <img
          src="/logo.webp"
          class="w-12 h-12 sm:w-16 sm:h-16 object-contain mb-2 sm:mb-0 sm:mr-4"
        />
        <h1 class="text-xl sm:text-2xl font-bold">系统初始化</h1>
      </div>
      <p class="text-foreground/70 text-sm mb-4">
        检测到当前系统尚未创建用户，请按步骤完成配置。
      </p>

      <div class="w-full max-w-[28rem]">
        <div
          class="rounded-xl shadow-xl border bg-surface border-border overflow-hidden"
        >
          <!-- Tab 栏 -->
          <div class="flex border-b border-border bg-surface-muted/50">
            <button
              v-for="t in tabs"
              :key="t.key"
              type="button"
              @click="goTab(t.key)"
              :class="[
                'flex-1 py-3 px-4 text-sm font-medium transition-colors',
                activeTab === t.key
                  ? 'bg-surface text-foreground border-b-2 border-primary-600 -mb-px'
                  : 'text-foreground/60 hover:text-foreground/80 hover:bg-surface-muted',
              ]"
            >
              {{ t.label }}
            </button>
          </div>

          <div class="p-4 md:p-6">
            <!-- Tab：系统信息 -->
            <section v-show="activeTab === 'system'" class="space-y-4">
              <UiTextInput
                v-model="systemForm.title"
                label="站点标题"
                placeholder="如：Cashbook"
              />
              <UiTextInput
                v-model="systemForm.description"
                label="站点描述"
                placeholder="可选"
              />
              <UiTextInput
                v-model="systemForm.keywords"
                label="关键词"
                placeholder="可选，逗号分隔"
              />
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="systemForm.openRegister"
                  type="checkbox"
                  class="rounded border-border"
                />
                <span class="text-sm text-foreground/80">开放注册</span>
              </label>
              <div class="pt-2">
                <button
                  type="button"
                  @click="goTab('admin')"
                  class="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  下一步：超管账号
                </button>
              </div>
            </section>

            <!-- Tab：超管账号 -->
            <section v-show="activeTab === 'admin'" class="space-y-4">
              <form @submit.prevent="submit" class="space-y-4">
                <UiTextInput
                  v-model="adminForm.name"
                  label="昵称"
                  placeholder="管理员"
                />
                <UiTextInput
                  v-model="adminForm.username"
                  label="账号"
                  placeholder="至少 4 个字符"
                  :error="formErrors.username"
                  required
                />
                <UiTextInput
                  v-model="adminForm.password"
                  label="密码"
                  placeholder="至少 8 个字符"
                  :error="formErrors.password"
                  password
                  required
                />
                <UiTextInput
                  v-model="adminForm.againPassword"
                  label="确认密码"
                  placeholder="再次输入密码"
                  :error="formErrors.againPassword"
                  password
                  required
                />
                <div class="flex gap-3 pt-2">
                  <button
                    type="button"
                    @click="goTab('system')"
                    class="flex-1 py-3 px-4 border border-border rounded-lg text-foreground/80 hover:bg-surface-muted transition-colors duration-200"
                  >
                    上一步
                  </button>
                  <button
                    type="submit"
                    :disabled="loading"
                    class="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
                  >
                    {{ loading ? "提交中…" : "完成初始化" }}
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>

      <p class="mt-4 text-sm text-foreground/50">
        <NuxtLink to="/login" class="text-primary-600 hover:underline"
          >返回登录</NuxtLink
        >
      </p>
    </div>
  </div>
</template>
