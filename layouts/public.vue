<script setup lang="ts">
import {
  showSetConvertDialog,
  showBookDialogFlag,
  showChangePasswordDialog,
} from "~/utils/flag";
import { SystemConfig, GlobalUserInfo } from "~/utils/store";
import { getUserInfo, doApi } from "~/utils/api";
import { globalToggleTheme } from "~/utils/common";

// Theme and responsive state
const isDark = ref(false);
const isMobile = ref(false);

// Sidebar state
const sidebarOpen = ref(false);

// User and book state
const bookName = ref("");
const route = useRoute();
const openMenu = computed(() => route.path.slice(1) || "calendar");

// Theme functions
const toggleTheme = () => {
  isDark.value = globalToggleTheme(isDark.value);
};

// Responsive functions
const updateResponsive = () => {
  if (typeof window !== "undefined") {
    isMobile.value = window.innerWidth < 768;
    if (!isMobile.value) {
      sidebarOpen.value = false;
    }
  }
};

onMounted(() => {
  // Initialize theme
  if (typeof window !== "undefined") {
    // Check for saved preference first
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
      isDark.value = savedTheme === "dark";
    } else {
      // If no saved preference, use system preference
      isDark.value = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    // Apply dark mode class
    document.documentElement.classList.toggle("dark", isDark.value);

    // Initialize responsive
    updateResponsive();
    window.addEventListener("resize", updateResponsive);
  }

  // Set up book and user info
  bookName.value = localStorage.getItem("bookName") || "";
  if (!bookName.value) {
    showBookDialogFlag.value.visible = true;
  }
  getUserInfo();

  // Check for version updates
  checkVersion();
});

onUnmounted(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", updateResponsive);
  }
});

// Navigation methods
const logout = () => {
  localStorage.removeItem("bookId");
  localStorage.removeItem("bookName");
  doApi.get("api/logout").then(() => {
    Alert.success("退出登录");
    setTimeout(() => {
      navigateTo("/login");
    }, 100);
  });
};

const navigateToPath = (path: string) => {
  navigateTo({ path: `/${path}` });
};

const openAdmin = () => {
  window.open(`/admin`, "_blank");
};

const openConvertDialog = () => {
  showSetConvertDialog.value = true;
};

const openChangePasswordDialog = () => {
  showChangePasswordDialog.value = true;
};

// Version check (keeping original functionality)
const checkVersion = () => {
  fetch("https://api.github.com/repos/dingdangdog/cashbook/releases/latest")
    .then((res) => res.json())
    .then((data) => {
      const latestVersion = data.tag_name.replace("v", "");
      const currentVersion = SystemConfig.value?.version;
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
    class="tw-h-screen tw-p-0 tw-m-0 tw-overflow-hidden tw-bg-gray-50 dark:tw-bg-gray-950 tw-transition-colors tw-duration-200"
  >
    <!-- Header -->
    <LayoutAppHeader
      :book-name="bookName"
      :is-mobile="isMobile"
      @toggle-sidebar="sidebarOpen = !sidebarOpen"
      @logout="logout"
      @open-admin="openAdmin"
      @open-convert-dialog="openConvertDialog"
      @open-change-password-dialog="openChangePasswordDialog"
      @show-book-dialog="showBookDialogFlag.visible = true"
    />

    <div class="tw-flex tw-relative" style="height: calc(100vh - 64px)">
      <!-- Sidebar - Desktop -->
      <div
        v-if="!isMobile"
        class="tw-w-64 tw-flex-shrink-0 tw-h-full tw-overflow-y-auto"
      >
        <LayoutAppSidebar
          :is-open="true"
          :is-mobile="false"
          :current-path="openMenu"
          :is-dark="isDark"
          @navigate="navigateToPath"
          @toggle-theme="toggleTheme"
        />
      </div>

      <!-- Sidebar - Mobile -->
      <LayoutAppSidebar
        v-if="isMobile"
        :is-open="sidebarOpen"
        :is-mobile="true"
        :current-path="openMenu"
        :is-dark="isDark"
        @close="sidebarOpen = false"
        @navigate="navigateToPath"
        @toggle-theme="toggleTheme"
      />

      <!-- Main Content -->
      <main
        :class="[
          'tw-flex-1 tw-h-full tw-overflow-y-auto',
          isMobile ? 'tw-pb-16' : '', // Add bottom padding for mobile bottom nav
        ]"
      >
        <div class="">
          <slot></slot>
        </div>
      </main>
    </div>

    <!-- Bottom Navigation - Mobile Only -->
    <LayoutAppBottomNav
      v-if="isMobile"
      :current-path="openMenu"
      @navigate="navigateToPath"
    />

    <!-- Global Components -->
    <GlobalAlert />
    <GlobalConfirm />

    <!-- Dialogs -->
    <DialogBookDialog v-if="showBookDialogFlag.visible" />
    <DialogSetConvertDialog v-if="showSetConvertDialog" />
    <DialogChangePasswordDialog v-if="showChangePasswordDialog" />
  </div>
</template>

<style scoped>
/* Custom scrollbar for dark mode */
:deep(.tw-overflow-y-auto) {
  scrollbar-width: thin;
  scrollbar-color: theme("colors.gray.400") transparent;
}

:deep(.tw-overflow-y-auto::-webkit-scrollbar) {
  width: 6px;
}

:deep(.tw-overflow-y-auto::-webkit-scrollbar-track) {
  background: transparent;
}

:deep(.tw-overflow-y-auto::-webkit-scrollbar-thumb) {
  background-color: theme("colors.gray.400");
  border-radius: 3px;
}

:deep(.dark .tw-overflow-y-auto::-webkit-scrollbar-thumb) {
  background-color: theme("colors.gray.600");
}

/* Ensure smooth transitions */
* {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}
</style>
