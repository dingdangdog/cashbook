<script setup lang="ts">
import { showJimiAssistant } from "~/utils/flag";
import { XMarkIcon } from "@heroicons/vue/24/outline";
import JimiChat from "./JimiChat.vue";

const close = () => {
  showJimiAssistant.value = false;
};
</script>

<template>
  <div
    v-if="showJimiAssistant"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    @click.self="close"
  >
    <div
      class="flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-border bg-background shadow-xl"
      @click.stop
    >
      <div
        class="flex flex-shrink-0 items-center justify-between border-b border-border bg-surface px-4 py-3"
      >
        <h3 class="text-lg font-semibold text-foreground">Jimi 助手</h3>
        <button
          type="button"
          class="rounded p-1 text-foreground/60 hover:bg-surface-muted hover:text-foreground"
          aria-label="关闭"
          @click="close"
        >
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>
      <div class="flex-1 min-h-0">
        <JimiChat :show-session-list="true" />
      </div>
    </div>
  </div>
</template>
