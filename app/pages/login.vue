<script setup lang="ts">
definePageMeta({
  unauthenticatedOnly: true,
});

import { BookOpenIcon, SunIcon, MoonIcon } from "@heroicons/vue/24/outline";

import { SystemConfig } from "~/utils/store";
import { checkSignIn, clearAuthStorage } from "~/utils/common";

const themeStore = useThemeStore();
const isDark = computed(() => themeStore.isDark);

const toggleTheme = () => {
  themeStore.toggleTheme();
};

const openRegister = ref(false);
const registerDialog = ref(false);

if (SystemConfig.value) {
  openRegister.value = SystemConfig.value.openRegister;
}

const loginParam = ref<any>({
  username: "",
  password: "",
});

const loginFormErrors = ref<{ [key: string]: string }>({});
const validateLoginForm = () => {
  loginFormErrors.value = {};

  if (!loginParam.value.username) {
    loginFormErrors.value.username = "必填";
  } else if (loginParam.value.username.length < 4) {
    loginFormErrors.value.username = "账号必须大于等于4个字符";
  }

  if (!loginParam.value.password) {
    loginFormErrors.value.password = "必填";
  } else if (loginParam.value.password.length < 8) {
    loginFormErrors.value.password = "密码必须大于等于8个字符";
  }

  return Object.keys(loginFormErrors.value).length === 0;
};

const loginLoading = ref(false);
const login = () => {
  if (!validateLoginForm()) return;
  loginLoading.value = true;
  doApi
    .post<UserInfo>("api/login", loginParam.value)
    .then((user) => {
      if (user) {
        console.log("user", user);
        useUserStore().setUser(user);
        // debugger;
        Alert.success("登录成功");
        console.log("fromUrl", fromUrl.value);
        if (fromUrl.value && fromUrl.value.startsWith("http")) {
          window.location.href = fromUrl.value;
        } else {
          navigateTo(fromUrl.value || "/user/jimi");
        }
      }
    })
    .catch(() => {
      // 错误已在 doApi 中通过 Alert 展示
    })
    .finally(() => {
      loginLoading.value = false;
    });
};

const registerParam = ref({
  name: "",
  username: "",
  password: "",
  againPassword: "",
});

const registerFormErrors = ref<{ [key: string]: string }>({});
const validateRegisterForm = () => {
  registerFormErrors.value = {};

  if (!registerParam.value.username) {
    registerFormErrors.value.username = "必填";
  } else if (registerParam.value.username.length < 4) {
    registerFormErrors.value.username = "账号必须大于等于4个字符";
  }

  if (!registerParam.value.password) {
    registerFormErrors.value.password = "必填";
  } else if (registerParam.value.password.length < 8) {
    registerFormErrors.value.password = "密码必须大于等于8个字符";
  }

  if (!registerParam.value.againPassword) {
    registerFormErrors.value.againPassword = "必填";
  } else if (
    registerParam.value.againPassword !== registerParam.value.password
  ) {
    registerFormErrors.value.againPassword = "密码不一致";
  }

  return Object.keys(registerFormErrors.value).length === 0;
};

const register = async () => {
  if (validateRegisterForm()) {
    doApi.post<UserInfo>("api/register", registerParam.value).then((res) => {
      Alert.success("注册成功，请登录");
      loginParam.value.username = registerParam.value.username;
      loginParam.value.password = registerParam.value.password;
      registerDialog.value = false;
    });
  }
};

const fromUrl = ref();
onMounted(async () => {
  const route = useRoute();
  const loginUrl = route.path;
  const callbackUrl = route.query.callbackUrl;
  if (loginUrl != callbackUrl) {
    fromUrl.value = callbackUrl;
  }

  // 先检查是否未初始化，避免「有 cookie 但 DB 已重置」导致 init/index/login 来回跳转
  let checkResult: number;
  try {
    checkResult = await doApi.get<number>("api/check");
  } catch {
    checkResult = -1;
  }
  if (checkResult === 0) {
    clearAuthStorage();
    navigateTo("/init");
    return;
  }
  if (checkResult === -1) {
    Confirm.open({
      title: "提示",
      content: "你的数据库很可能没有成功连接，请检查！！！",
      confirmText: "知道了",
      cancelText: "我不管了",
      confirm: () => { },
      cancel: () => { },
    });
    return;
  }

  // 已初始化：若已有登录态则直接跳转
  if (checkSignIn()) {
    Alert.success("登录成功");
    setTimeout(() => {
      if (fromUrl.value) {
        window.location.href = fromUrl.value;
      } else {
        navigateTo("/user/jimi");
      }
    }, 200);
  }
});

const toDocumentation = () => {
  window.open("https://doc.cashbook.oldmoon.top", "_blank");
};

const toGithub = () => {
  window.open("https://github.com/dingdangdog/cashbook", "_blank");
};
</script>

<template>

  <Head>
    <Title>{{ SystemConfig?.title }}</Title>
    <Meta name="description" :content="SystemConfig?.description" />
    <Meta name="keywords" :content="`Cashbook,记账本,私人记账,开源账本,dingdangdog,月上老狗,${SystemConfig?.keywords}`" />
  </Head>

  <div class="h-screen p-2 transition-colors duration-300 bg-background text-foreground">
    <!-- 右上角导航栏 -->
    <div class="fixed top-2 right-2 flex items-center gap-2 z-50">
      <!-- 主题切换按钮 - 移到最左侧 -->
      <button @click="toggleTheme()"
        class="p-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg bg-surface-muted text-foreground hover:bg-surface border border-border"
        title="切换主题">
        <SunIcon v-if="isDark" class="w-5 h-5 text-foreground" />
        <MoonIcon v-else class="w-5 h-5 text-foreground" />
      </button>

      <button @click="toDocumentation()"
        class="p-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg bg-surface-muted text-foreground/70 hover:bg-surface border border-border"
        title="文档站">
        <BookOpenIcon class="w-5 h-5" />
      </button>

      <button @click="toGithub()"
        class="p-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg bg-surface-muted text-foreground/70 hover:bg-surface border border-border"
        title="前往Github">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path
            d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      </button>
    </div>

    <div class="flex flex-col items-center justify-center h-full p-4 sm:px-4 -mt-12">
      <!-- Logo 和标题 - 响应式调整 -->
      <div class="flex flex-col sm:flex-row items-center mb-4 text-center sm:text-left">
        <img src="/logo.webp" class="w-12 h-12 sm:w-16 sm:h-16 object-contain mb-2 sm:mb-0 sm:mr-4" />
        <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold">
          {{ SystemConfig?.title }}
        </h1>
      </div>

      <!-- 登录表单 - 响应式调整 -->
      <div class="w-full max-w-[26rem]">
        <div class="rounded-xl shadow-xl p-4 md:p-6 border bg-surface border-border">
          <form @submit.prevent="login" class="space-y-4">
            <UiTextInput id="username" v-model="loginParam.username" placeholder="请输入账号"
              :error="loginFormErrors.username" autocomplete="username" @keyup.enter="login()" />
            <UiTextInput id="password" v-model="loginParam.password" placeholder="请输入密码"
              :error="loginFormErrors.password" autocomplete="current-password" password @keyup.enter="login()" />

            <!-- 登录按钮 -->
            <div>
              <button type="submit" :disabled="loginLoading"
                class="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold mt-4 py-2 sm:py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed">
                {{ loginLoading ? "登录中..." : "登录" }}
              </button>
            </div>

            <!-- 注册按钮 -->
            <div v-if="openRegister" class="text-center pt-2">
              <button type="button" @click="registerDialog = true"
                class="font-medium transition-colors duration-200 text-primary-600 hover:text-primary-700">
                注册账号
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 注册对话框 -->
    <div v-if="registerDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        class="rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto bg-surface text-foreground border border-border">
        <div class="p-2">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-semibold">注册用户</h3>
            <button @click="registerDialog = false"
              class="transition-colors text-foreground/40 hover:text-foreground/70">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <form @submit.prevent="register" class="space-y-4">
            <UiTextInput v-model="registerParam.name" label="昵称" placeholder="请输入昵称" />
            <UiTextInput v-model="registerParam.username" label="账号" placeholder="请输入账号"
              :error="registerFormErrors.username" required />
            <UiTextInput v-model="registerParam.password" label="密码" placeholder="请输入密码"
              :error="registerFormErrors.password" password required />
            <UiTextInput v-model="registerParam.againPassword" label="确认密码" placeholder="请确认密码"
              :error="registerFormErrors.againPassword" password required />

            <div class="flex space-x-3 pt-4">
              <button type="button" @click="registerDialog = false"
                class="flex-1 px-4 py-3 border border-border rounded-lg text-foreground/80 hover:bg-surface-muted transition-colors duration-200">
                取消
              </button>
              <button type="submit"
                class="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200">
                注册
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <GlobalConfirm />
  </div>
</template>

<style scoped>
.-translate-y-1\/2 {
  transform: translateY(-50%);
}
</style>
