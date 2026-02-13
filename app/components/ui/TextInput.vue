<script setup lang="ts">
import { EyeIcon, EyeSlashIcon } from "@heroicons/vue/24/outline";

const model = defineModel<string>({ default: "" });

const props = withDefaults(
  defineProps<{
    label?: string;
    placeholder?: string;
    error?: string;
    required?: boolean;
    /** 是否为密码框（带显示/隐藏切换） */
    password?: boolean;
  }>(),
  { password: false },
);

const showPassword = ref(false);
const inputType = computed(() =>
  props.password ? (showPassword.value ? "text" : "password") : "text",
);
</script>

<template>
  <div>
    <label
      v-if="label"
      class="block text-sm font-medium text-foreground/80 mb-1"
    >
      {{ label }}{{ required ? " *" : "" }}
    </label>
    <div v-if="password" class="relative">
      <input
        v-model="model"
        :type="inputType"
        :placeholder="placeholder"
        :class="[
          'w-full px-3 py-2 pr-10 border rounded-lg bg-background text-foreground placeholder-foreground/40 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 input-no-outline',
          error ? 'border-red-500 bg-red-900/10' : 'border-border',
        ]"
      />
      <button
        type="button"
        @click="showPassword = !showPassword"
        class="absolute right-2 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/70 transition-colors"
        tabindex="-1"
      >
        <EyeIcon v-if="!showPassword" class="w-4 h-4" />
        <EyeSlashIcon v-else class="w-4 h-4" />
      </button>
    </div>
    <input
      v-else
      v-model="model"
      type="text"
      :placeholder="placeholder"
      :class="[
        'w-full px-3 py-2 border rounded-lg bg-background text-foreground placeholder-foreground/40 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 input-no-outline',
        error ? 'border-red-500 bg-red-900/10' : 'border-border',
      ]"
    />
    <p v-if="error" class="mt-1 text-sm text-red-500">
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
/* 彻底去掉浏览器默认 focus 轮廓，避免与 focus:ring 叠成两层 */
.input-no-outline {
  outline: none !important;
}
.input-no-outline:focus {
  outline: none !important;
}
.-translate-y-1\/2 {
  transform: translateY(-50%);
}
</style>
