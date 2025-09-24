<script setup lang="ts">
import {
  showSetConvertDialog,
  showBookDialogFlag,
  showChangePasswordDialog,
} from "~/utils/flag";
import { SystemConfig, GlobalUserInfo } from "~/utils/store";
import { getUserInfo, doApi } from "~/utils/api";

// Responsive state
const isMobile = ref(false);

// Sidebar state
const sidebarOpen = ref(false);

// Loading state for page transitions
const pageLoading = ref(false);

// User and book state
const bookName = ref("");
const route = useRoute();
const openMenu = computed(() => route.path.slice(1) || "calendar");

// Watch route changes to show loading
watch(
  () => route.path,
  (newPath, oldPath) => {
    if (newPath !== oldPath) {
      pageLoading.value = true;
      // Hide loading after a short delay to allow page to render
      setTimeout(() => {
        pageLoading.value = false;
      }, 500);
    }
  }
);

// Responsive functions
const updateResponsive = () => {
  if (typeof window !== "undefined") {
    isMobile.value = window.innerWidth < 1024;
    if (!isMobile.value) {
      sidebarOpen.value = false;
    }
  }
};

onMounted(() => {
  // Initialize responsive
  if (typeof window !== "undefined") {
    updateResponsive();
    window.addEventListener("resize", updateResponsive);
  }

  // Set up book and user info
  bookName.value = localStorage.getItem("bookName") || "";
  if (!bookName.value) {
    showBookDialogFlag.value.visible = true;
  }

  // 只有当 GlobalUserInfo 不存在时才调用 getUserInfo
  if (!GlobalUserInfo.value) {
    getUserInfo();
  }

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
  pageLoading.value = true;
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
  pageLoading.value = true;
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
    class="h-screen p-0 m-0 overflow-hidden bg-gray-50 dark:bg-gray-950 transition-colors duration-200"
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

    <div class="flex relative" style="height: calc(100vh - 64px)">
      <!-- Sidebar - Desktop -->
      <div v-if="!isMobile" class="w-64 flex-shrink-0 h-full overflow-y-auto">
        <LayoutAppSidebar
          :is-open="true"
          :is-mobile="false"
          :current-path="openMenu"
          @navigate="navigateToPath"
        />
      </div>

      <!-- Sidebar - Mobile -->
      <LayoutAppSidebar
        v-if="isMobile"
        :is-open="sidebarOpen"
        :is-mobile="true"
        :current-path="openMenu"
        @close="sidebarOpen = false"
        @navigate="navigateToPath"
      />

      <!-- Main Content -->
      <main
        :class="[
          'flex-1 h-full overflow-y-auto bg-gray-50 dark:bg-green-950/20 transition-colors duration-200 relative',
          isMobile ? 'pb-16' : '', // Add bottom padding for mobile bottom nav
        ]"
      >
        <!-- Loading Overlay -->
        <div
          v-if="pageLoading"
          class="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <div class="flex flex-col items-center space-y-4">
            <!-- Spinner -->
            <div class="relative">
              <div
                class="w-12 h-12 border-4 border-gray-300 dark:border-gray-600 rounded-full animate-spin"
              ></div>
              <div
                class="w-12 h-12 border-4 border-transparent border-t-green-500 rounded-full animate-spin absolute top-0 left-0"
              ></div>
            </div>
            <!-- Loading Text -->
            <div class="text-sm text-gray-600 dark:text-gray-300 font-medium">
              页面加载中...
            </div>
          </div>
        </div>

        <!-- Page Content -->
        <div :class="{ 'opacity-75': pageLoading }">
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
    <GlobalConfirm />

    <!-- Dialogs -->
    <DialogBookDialog v-if="showBookDialogFlag.visible" />
    <DialogSetConvertDialog v-if="showSetConvertDialog" />
    <DialogChangePasswordDialog v-if="showChangePasswordDialog" />
  </div>
</template>

<style scoped>
/* Custom scrollbar for dark mode */
:deep(.overflow-y-auto) {
  scrollbar-width: thin;
  scrollbar-color: theme("colors.gray.400") transparent;
}

:deep(.overflow-y-auto::-webkit-scrollbar) {
  width: 6px;
}

:deep(.overflow-y-auto::-webkit-scrollbar-track) {
  background: transparent;
}

:deep(.overflow-y-auto::-webkit-scrollbar-thumb) {
  background-color: theme("colors.gray.400");
  border-radius: 3px;
}

:deep(.dark .overflow-y-auto::-webkit-scrollbar-thumb) {
  background-color: theme("colors.gray.600");
}

/* Ensure smooth transitions */
* {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}
</style>
