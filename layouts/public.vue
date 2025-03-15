<script setup lang="ts">
import {
  showSetConvertDialog,
  showBookDialogFlag,
  showChangePasswordDialog,
} from "~/utils/flag";
import { SystemConfig } from "~/utils/store";

const theme = useTheme();
const themeValue = ref(false);
const toggleTheme = () => {
  // console.log(themeValue.value);
  const to = theme.global.name.value == "light" ? "dark" : "light";
  theme.global.name.value = to;
  localStorage.setItem("theme", to);
};
const logout = () => {
  localStorage.removeItem("bookId");
  localStorage.removeItem("bookName");
  doApi.get("api/logout").then((res) => {
    Alert.success("退出登录");
    setTimeout(() => {
      navigateTo("/login");
    }, 100);
  });
};
const miniWindow = ref(false);
const menuer = ref(false);
onMounted(() => {
  miniWindow.value = window.innerWidth < 1280;
  menuer.value = !miniWindow.value;

  const nowTheme = localStorage.getItem("theme");
  if (nowTheme) {
    theme.global.name.value = nowTheme;
  }
  if (theme.global.name.value == "light") {
    // console.log(theme.global.name.value)
    themeValue.value = true;
  }
});

type Menu = {
  title: string;
  icon?: string;
  color?: string;
  path?: string;
  children?: Menu[];
};

const openMenu = ref<string>("orders");

const items = ref<Menu[]>([
  {
    title: "账本日历",
    path: "calendar",
    icon: "mdi-calendar-month",
    color: "rgb(8,155,229)",
  },
  {
    title: "数据分析",
    path: "analysis",
    icon: "mdi-poll",
    color: "rgb(149,117,205)",
  },
  {
    title: "流水管理",
    path: "flows",
    icon: "mdi-hand-water",
    color: "rgb(76,175,80)",
  },
  {
    title: "账本管理",
    path: "books",
    icon: "mdi-notebook-edit",
    color: "rgb(77,182,172)",
  },
  {
    title: "类型管理",
    path: "types",
    icon: "mdi-shape-plus",
    color: "#E57373",
  },
  {
    title: "Github",
    path: "github",
    icon: "mdi-github",
    color: "black",
  },
]);

const toPath = (menu: Menu) => {
  if (menu.path == "github") {
    window.open(`https://github.com/dingdangdog/cashbook`, "_blank");
    return;
  }
  openMenu.value = menu.path || "calendar";
  navigateTo({ path: `/${openMenu.value}` });
};

const showMenuTitle = ref(true);

const bookName = ref("");
onMounted(() => {
  bookName.value = localStorage.getItem("bookName") || "";
  if (!bookName.value) {
    showBookDialogFlag.value.visible = true;
  }
  getUserInfo();
});

// 获取最新发布的版本（如果想动态获取版本）
// latest_version=$(curl --silent "https://api.github.com/repos/$REPO/releases/latest" | grep -o '"tag_name": "[^"]*' | sed 's/"tag_name": "//')

const checkVersion = () => {
  fetch("https://api.github.com/repos/dingdangdog/cashbook/releases/latest")
    .then((res) => res.json())
    .then((data) => {
      const latestVersion = data.tag_name.replace("v", "");
      const currentVersion = SystemConfig.value?.version; // Assuming SystemConfig has the current version
      const newVersionNotify = localStorage.getItem(latestVersion);
      if (newVersionNotify) {
        return;
      }
      if (currentVersion && latestVersion && currentVersion !== latestVersion) {
        console.log(`New version available: ${latestVersion}`);
        Confirm.open({
          title: "提示",
          content: `当前版本：${currentVersion}，最新版本：${latestVersion}，可前往Github查看更新内容！`,
          confirmText: "前往Github",
          cancelText: "不再提示",
          closeText: "知道了",
          confirm: () => {
            window.open(
              `https://github.com/dingdangdog/cashbook/releases`,
              "_blank"
            );
          },
          cancel: () => {
            // 设置本地缓存
            localStorage.setItem(latestVersion, "true");
          },
          close: () => {},
        });
      } else {
        console.log("You are using the latest version.");
      }
    })
    .catch((error) => {
      console.error("Error fetching version data:", error);
    });
};
checkVersion();

const openAdmin = () => {
  window.open(`/admin`, "_blank");
};
const openCovertDialog = () => {
  showSetConvertDialog.value = true;
};
const openChangePasswordDialog = () => {
  showChangePasswordDialog.value = true;
};
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
  <v-layout class="" id="admin-container">
    <v-app-bar>
      <template v-slot:prepend>
        <v-app-bar-nav-icon
          v-if="miniWindow"
          @click="menuer = !menuer"
        ></v-app-bar-nav-icon>
      </template>
      <div
        class="tw-flex tw-items-center md:tw-justify-between tw-w-full md:tw-px-4 tw-space-x-2"
      >
        <div class="tw-hidden md:tw-flex tw-items-center">
          <v-btn icon>
            <img src="/logo.png" height="40" alt="logo" />
          </v-btn>
          <div class="tw-ml-2 tw-mt-2 tw-text-lg tw-font-bold">Cashbook</div>
        </div>

        <div class="tw-flex tw-items-center tw-space-x-4 md:tw-pr-8">
          <span
            class="tw-hidden md:tw-block"
            style="margin: 0 auto; padding: 0 0.5rem"
            v-if="bookName"
            >当前账本：{{ bookName }}</span
          >
          <v-btn
            class="no-drag"
            color="teal-darken-3"
            variant="elevated"
            @click="showBookDialogFlag.visible = true"
          >
            切换账本
          </v-btn>
        </div>
        <div class="tw-flex tw-items-center tw-space-x-4">
          <span
            class="tw-hidden md:tw-block"
            style="margin: 0 auto; padding: 0 0.5rem"
            v-if="GlobalUserInfo"
            >欢迎：{{ GlobalUserInfo?.name }}</span
          >
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                class="no-drag"
                color="blue-grey-darken-3"
                variant="elevated"
              >
                系统管理
              </v-btn>
            </template>
            <v-list>
              <v-list-item class="cursor-pointer" @click="openAdmin()">
                <span style="font-size: 1rem">后台管理</span>
              </v-list-item>
              <v-list-item class="cursor-pointer" @click="openCovertDialog()">
                <span style="font-size: 1rem">CSV导入映射配置</span>
              </v-list-item>
              <v-list-item
                class="cursor-pointer"
                @click="openChangePasswordDialog()"
              >
                <span style="font-size: 1rem">修改密码</span>
              </v-list-item>
              <v-list-item class="cursor-pointer" @click="logout()">
                <span style="font-size: 1rem">退出登录</span>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </div>
    </v-app-bar>
    <v-navigation-drawer v-model="menuer" location="left" width="200">
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          @click="toPath(item)"
          class="tw-cursor-pointer hover:tw-bg-gray-500/20"
          :class="openMenu == item.path ? 'selected-menu' : ''"
        >
          <!-- 一级菜单 -->
          <v-list-item-title v-if="!item.children">
            <div class="tw-flex tw-items-center">
              <v-icon
                class="menu-icon"
                :color="item.color"
                :icon="item.icon"
              ></v-icon>
              <span
                class="tw-pl-4"
                :class="showMenuTitle ? 'tw-flex' : 'tw-hidden'"
                :style="`color:${item.color}`"
              >
                {{ item.title }}
              </span>
            </div>
          </v-list-item-title>

          <!-- 有下级，则形成菜单组，显示二级菜单 -->
          <v-list-group :value="item.title" v-else>
            <template v-slot:activator="{ props }">
              <v-list-item v-bind="props" :title="item.title"> </v-list-item>
            </template>

            <v-list-item
              v-for="(child, i2) in item.children"
              :key="i2"
              @click="toPath(child)"
              class="tw-cursor-pointer hover:tw-bg-gray-500/20"
              :class="openMenu == item.path ? 'selected-menu' : ''"
            >
              <v-list-item-title>
                <v-icon
                  class="menu-icon"
                  :color="item.color"
                  :icon="child.icon"
                ></v-icon>
                <span :style="`color:${item.color}`">{{ child.title }}</span>
              </v-list-item-title>
            </v-list-item>
          </v-list-group>
        </v-list-item>
      </v-list>

      <div class="menu-footer">
        <ClientOnly>
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
        </ClientOnly>
      </div>
      <!-- <v-btn
        style="position: absolute; bottom: 0; width: 100%"
        @click="tiggleShowMenu()"
      >
        <v-icon icon="mdi-code-tags"></v-icon>
      </v-btn> -->
    </v-navigation-drawer>

    <v-main>
      <slot></slot>
    </v-main>
    <GlobalAlert />
    <GlobalConfirm />

    <DialogBookDialog v-if="showBookDialogFlag.visible" />
    <!-- 弹出框表单：类型转换配置 -->
    <DialogSetConvertDialog v-if="showSetConvertDialog" />
    <DialogChangePasswordDialog v-if="showChangePasswordDialog" />
  </v-layout>
</template>

<style scoped>
.menu-footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  text-align: center;
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.selected-menu {
  background: rgba(106, 102, 102, 0.2);
}
</style>
