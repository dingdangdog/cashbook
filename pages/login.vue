<script setup lang="ts">
definePageMeta({
  unauthenticatedOnly: true,
});

import { useTheme } from "vuetify";
import { SystemConfig } from "~/utils/store";
import { checkSignIn } from "~/utils/common";

const theme = useTheme();
const themeValue = ref(false);
const toggleTheme = () => {
  // console.log(themeValue.value)
  const to = theme.global.name.value == "light" ? "dark" : "light";
  theme.global.name.value = to;
  localStorage.setItem("theme", to);
};

const tab = ref("login");

const usernameRules = [
  (v: string) => !!v || "必填",
  (v: string) => (v && v.length >= 4) || "账号必须大于等于4个字符",
];
const passwordRules = [
  (v: string) => !!v || "必填",
  (v: string) => (v && v.length >= 8) || "密码必须大于等于8个字符",
];
const againPasswordRules = [
  (v: string) => !!v || "必填",
  (v: string) => v == registerParam.value.password || "密码不一致",
];

const openRegister = ref(false);
const registerDialog = ref(false);

if (SystemConfig.value) {
  openRegister.value = SystemConfig.value.openRegister;
}

const loginForm = ref();
const loginParam = ref<any>({
  username: "",
  password: "",
});
const login = async () => {
  const { valid } = await loginForm.value.validate();
  if (valid) {
    // 框架密码登录
    doApi.post("api/login", loginParam.value).then((res) => {
      Alert.success("登录成功");
      navigateTo(fromUrl.value || "/");
    });
  }
};

const registerForm = ref();
const registerParam = ref({
  name: "",
  username: "",
  password: "",
  againPassword: "",
});
const register = async () => {
  const { valid } = await registerForm.value.validate();

  if (valid) {
    // alert("Form is valid");
    doApi.post<UserInfo>("api/register", registerParam.value).then((res) => {
      Alert.success("注册成功，请登录");
      loginParam.value.username = registerParam.value.username;
      loginParam.value.password = registerParam.value.password;
      registerDialog.value = false;
      tab.value = "login";
    });
  }
};

const lookLoginPS = ref(false);
const lookRegisterPS = ref(false);
const lookRegisterAPS = ref(false);

const fromUrl = ref();
onMounted(async () => {
  const route = useRoute();
  const loginUrl = route.path;
  const callbackUrl = route.query.callbackUrl;
  if (loginUrl != callbackUrl) {
    fromUrl.value = callbackUrl;
  }

  const nowTheme = localStorage.getItem("theme");
  if (nowTheme) {
    theme.global.name.value = nowTheme;
  }
  if (theme.global.name.value == "light") {
    // console.log(theme.global.name.value)
    themeValue.value = true;
  }

  // 校验登录
  if (checkSignIn()) {
    Alert.success("登录成功");
    setTimeout(() => {
      if (fromUrl.value) {
        window.location.href = fromUrl.value;
      } else {
        navigateTo("/");
      }
    }, 200);
  }

  doApi.get("api/check").then((res) => {
    console.log("res", res);
    if (!res) {
      Confirm.open({
        title: "提示",
        content: "当前系统没有普通用户，请前往【后台】“添加用户”或“开放注册”！",
        confirmText: "前往后台",
        cancelText: "知道了",
        confirm: () => {
          navigateTo("/admin");
        },
      });
    }
  });
});
</script>

<template>
  <Head>
    <Title>{{ SystemConfig?.title }}</Title>
    <Meta name="description" :content="SystemConfig?.description" />
    <Meta
      name="keywords"
      :content="`Cashbook,记账本,私人记账,开源账本,dingdangdog,月上老狗,${SystemConfig?.keywords}`"
    />
  </Head>
  <div
    class="tw-tw-w-full tw-h-full tw-flex tw-flex-col tw-items-center tw-justify-center md:tw-pt-36"
  >
    <div
      class="tw-flex tw-items-center tw-max-w-[28rem] tw-w-full tw-justify-start tw-space-x-4 tw-py-4 tw-mt-8"
    >
      <img src="/logo.png" class="tw-w-16 tw-h-16 tw-object-contain" />
      <h1 class="tw-text-2xl">欢迎使用{{ SystemConfig?.title }}</h1>
    </div>

    <!-- <v-sheet rounded> -->
    <v-card class="login-card">
      <v-card-text>
        <v-form ref="loginForm">
          <v-text-field
            v-model="loginParam.username"
            :rules="usernameRules"
            :counter="16"
            name="username"
            label="账号"
            required
          ></v-text-field>
          <v-text-field
            v-model="loginParam.password"
            :rules="passwordRules"
            name="password"
            auto-complate="current-password"
            :counter="36"
            label="密码"
            required
            :type="lookLoginPS ? 'text' : 'password'"
            :append-inner-icon="lookLoginPS ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append-inner="lookLoginPS = !lookLoginPS"
            @keyup.enter="login()"
          ></v-text-field>
          <div class="tw-flex tw-flex-col">
            <v-btn color="primary" block @click="login"> 登录 </v-btn>
          </div>
        </v-form>
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
          "
        >
          <v-btn v-show="openRegister" @click="registerDialog = true"
            >注册账号</v-btn
          >
          <v-btn
            icon="mdi-github"
            title="前往Github"
            @click="toGithub()"
          ></v-btn>
          <v-switch
            color="warning"
            v-model="themeValue"
            @update:modelValue="toggleTheme()"
            hide-details
            inset
          >
            <template v-slot:label>
              <v-icon
                :icon="
                  themeValue ? 'mdi-emoticon-cool-outline' : 'mdi-weather-night'
                "
                :color="themeValue ? 'warning' : 'white'"
              ></v-icon>
            </template>
          </v-switch>
        </div>
      </v-card-text>
    </v-card>

    <v-dialog
      v-model="registerDialog"
      transition="dialog-bottom-transition"
      style="max-width: 30rem"
    >
      <template v-slot:default="{ isActive }">
        <v-card style="padding: 1rem">
          <v-card-title> 注册用户 </v-card-title>
          <v-card-text>
            <v-form ref="registerForm">
              <v-text-field
                v-model="registerParam.name"
                name="name"
                :counter="12"
                label="昵称"
              ></v-text-field>
              <v-text-field
                v-model="registerParam.username"
                :rules="usernameRules"
                name="username"
                :counter="16"
                label="账号"
                required
              ></v-text-field>
              <v-text-field
                v-model="registerParam.password"
                :rules="passwordRules"
                :counter="36"
                name="password"
                label="密码"
                :type="lookRegisterPS ? 'text' : 'password'"
                :append-inner-icon="lookRegisterPS ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="lookRegisterPS = !lookRegisterPS"
                required
              ></v-text-field>
              <v-text-field
                v-model="registerParam.againPassword"
                :rules="againPasswordRules"
                :counter="36"
                label="确认密码"
                required
                :type="lookRegisterAPS ? 'text' : 'password'"
                :append-inner-icon="lookRegisterAPS ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="lookRegisterAPS = !lookRegisterAPS"
              ></v-text-field>
            </v-form>
          </v-card-text>

          <v-card-actions class="justify-end">
            <v-btn text="取消" @click="registerDialog = false"></v-btn>
            <v-btn color="success" block @click="register"> 注册 </v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-dialog>
    <GlobalConfirm />
  </div>
</template>

<style scoped>
.login-form {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.login-card {
  margin: 1rem auto !important;
  padding: 1rem;
  max-width: 30rem;
  width: 100%;
}
</style>
