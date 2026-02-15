<script setup lang="ts">
definePageMeta({
  layout: "public",
  middleware: ["auth"],
});

import JimiChat from "~/components/jimi/JimiChat.vue";

const isMobile = ref(false);
const updateResponsive = () => {
  if (typeof window !== "undefined") {
    isMobile.value = window.innerWidth < 1024;
  }
};

onMounted(() => {
  updateResponsive();
  window.addEventListener("resize", updateResponsive);
});
onUnmounted(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", updateResponsive);
  }
});

const router = useRouter();
const goBack = () => {
  router.back();
};
</script>

<template>
  <!-- 固定高度容器，避免在 public 布局下无限展开 -->
  <div
    class="flex flex-col bg-background text-foreground overflow-hidden"
    :class="isMobile ? 'h-[calc(100vh-4rem-3rem)]' : 'h-[calc(100vh-4rem)]'"
  >
    <!-- 桌面端：保留顶部栏 -->
    <header
      v-if="!isMobile"
      class="flex flex-shrink-0 items-center gap-2 border-b border-border bg-surface px-4 py-3"
    >
      <button
        type="button"
        class="rounded p-1 text-foreground/80 hover:bg-surface-muted"
        aria-label="返回"
        @click="goBack"
      >
        <svg
          class="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <h1 class="text-lg font-semibold">Jimi 助手</h1>
    </header>
    <div class="flex-1 min-h-0 overflow-hidden">
      <JimiChat
        :show-session-list="true"
        :is-mobile="isMobile"
        :mobile-back-to-app="goBack"
      />
    </div>
  </div>
</template>
