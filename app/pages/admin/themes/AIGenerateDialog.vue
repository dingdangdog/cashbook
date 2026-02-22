<script setup lang="ts">
import { ref } from "vue";
import { generateAI, type AdminTheme } from "./api";
import { aiGenerateFlag } from "./flag";

const emits = defineEmits<{
  success: [];
  cancel: [];
}>();

const form = ref({
  name: "",
  description: "",
  mode: "light" as "light" | "dark",
});

const errors = ref({
  name: "",
  description: "",
});

const loading = ref(false);

const validateForm = () => {
  errors.value = { name: "", description: "" };
  let isValid = true;

  if (!String(form.value.name || "").trim()) {
    errors.value.name = "主题名称不能为空";
    isValid = false;
  }

  if (!String(form.value.description || "").trim()) {
    errors.value.description = "主题描述不能为空";
    isValid = false;
  }

  return isValid;
};

const generate = async () => {
  if (!validateForm()) return;
  loading.value = true;

  try {
    const result = await generateAI({
      name: form.value.name.trim(),
      description: form.value.description.trim(),
      mode: form.value.mode,
    });
    Alert.success("AI生成主题成功");
    aiGenerateFlag.value = false;
    emits("success");
  } catch (err: any) {
    Alert.error("AI生成失败: " + (err?.message || err));
  } finally {
    loading.value = false;
  }
};

const close = () => {
  aiGenerateFlag.value = false;
  form.value = {
    name: "",
    description: "",
    mode: "light",
  };
  emits("cancel");
};
</script>

<template>
  <div
    v-if="aiGenerateFlag"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
  >
    <div
      class="bg-surface rounded-xl shadow-xl w-full max-w-2xl border border-border"
      @click.stop
    >
      <div class="px-6 py-4 border-b border-border flex justify-between items-center">
        <h3 class="text-lg font-semibold text-foreground">AI生成主题配色</h3>
        <button
          @click="close"
          class="text-muted hover:text-foreground transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="px-6 py-4 space-y-4">
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">
            主题名称 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.name"
            type="text"
            :class="[
              'w-full px-3 py-2 border rounded-lg bg-surface text-foreground placeholder-muted focus:outline-none focus:ring-2 transition-colors',
              errors.name ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary-500 focus:border-primary-500',
            ]"
            placeholder="如：清新绿意、深蓝之夜"
            :disabled="loading"
          />
          <p v-if="errors.name" class="mt-1 text-sm text-red-500">{{ errors.name }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-foreground mb-2">
            主题描述 <span class="text-red-500">*</span>
          </label>
          <textarea
            v-model="form.description"
            rows="4"
            :class="[
              'w-full px-3 py-2 border rounded-lg bg-surface text-foreground placeholder-muted focus:outline-none focus:ring-2 transition-colors',
              errors.description ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary-500 focus:border-primary-500',
            ]"
            placeholder="描述你想要的配色风格，如：清新的绿色系，适合阅读的护眼配色，温暖的橙色系等"
            :disabled="loading"
          ></textarea>
          <p v-if="errors.description" class="mt-1 text-sm text-red-500">{{ errors.description }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-foreground mb-2">
            主题模式 <span class="text-red-500">*</span>
          </label>
          <select
            v-model="form.mode"
            class="w-full px-3 py-2 border border-border rounded-lg bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            :disabled="loading"
          >
            <option value="light">浅色模式 (light)</option>
            <option value="dark">深色模式 (dark)</option>
          </select>
        </div>
      </div>

      <div class="px-6 py-4 border-t border-border flex justify-end space-x-3">
        <button
          @click="close"
          :disabled="loading"
          class="px-4 py-2 bg-surface-muted hover:bg-muted text-foreground rounded-lg transition-colors border border-border"
        >
          取消
        </button>
        <button
          @click="generate"
          :disabled="loading"
          class="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <svg v-if="loading" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ loading ? "生成中..." : "生成主题" }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
