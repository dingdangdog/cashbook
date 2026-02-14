<script setup lang="ts">
import { XMarkIcon } from "@heroicons/vue/24/outline";

const model = defineModel<string>({ default: "" });

const props = withDefaults(
  defineProps<{
    label?: string;
    placeholder?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    /** 可选项列表，支持输入过滤 */
    options?: string[];
  }>(),
  { options: () => [] },
);

const showDropdown = ref(false);
const activeIndex = ref(0);

const filteredOptions = computed(() => {
  const list = props.options || [];
  if (!model.value) return list;
  const q = model.value.toLowerCase();
  return list.filter((item) => item.toLowerCase().includes(q));
});

function openDropdown() {
  showDropdown.value = true;
  activeIndex.value = 0;
}

function closeDropdown() {
  setTimeout(() => {
    showDropdown.value = false;
  }, 200);
}

function clampIndex(index: number, length: number) {
  if (length <= 0) return -1;
  if (index < 0) return length - 1;
  if (index >= length) return 0;
  return index;
}

function select(item: string) {
  model.value = item;
  showDropdown.value = false;
}

function onInput(e: Event) {
  model.value = (e.target as HTMLInputElement).value;
  openDropdown();
}

function onKeydown(e: KeyboardEvent) {
  const list = filteredOptions.value;
  if (!showDropdown.value && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
    openDropdown();
  }
  if (e.key === "ArrowDown") {
    e.preventDefault();
    activeIndex.value = clampIndex(activeIndex.value + 1, list.length);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    activeIndex.value = clampIndex(activeIndex.value - 1, list.length);
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (activeIndex.value >= 0 && activeIndex.value < list.length) {
      select(list[activeIndex.value] || "");
    }
  } else if (e.key === "Escape") {
    showDropdown.value = false;
  }
}

const showClear = computed(
  () => !props.disabled && model.value !== "" && model.value != null,
);

function clearInput() {
  model.value = "";
  closeDropdown();
}
</script>

<template>
  <div>
    <label
      v-if="label"
      class="block text-sm font-medium text-foreground/80 mb-1"
    >
      {{ label }}{{ required ? " *" : "" }}
    </label>
    <div class="relative">
      <input
        :value="model"
        @input="onInput"
        @focus="openDropdown()"
        @blur="closeDropdown"
        @keydown="onKeydown($event)"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="[
          'w-full px-3 py-2 border rounded-lg bg-background text-foreground placeholder-foreground/40 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 input-no-outline disabled:opacity-70 disabled:cursor-not-allowed',
          showClear ? 'pr-10' : '',
          error ? 'border-red-500 bg-red-900/10' : 'border-border',
        ]"
      />
      <button
        v-if="showClear"
        type="button"
        @click="clearInput"
        class="absolute right-2 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/70 transition-colors"
        tabindex="-1"
      >
        <XMarkIcon class="w-4 h-4" />
      </button>
      <div
        v-if="showDropdown && filteredOptions.length > 0"
        class="absolute z-10 w-full mt-1 bg-surface border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto"
      >
        <div
          v-for="(item, index) in filteredOptions"
          :key="item"
          @mousedown.prevent="select(item)"
          :class="[
            'px-3 py-2 hover:bg-surface-muted cursor-pointer text-sm text-foreground',
            index === activeIndex ? 'bg-surface-muted' : '',
          ]"
        >
          {{ item }}
        </div>
      </div>
    </div>
    <p v-if="error" class="mt-1 text-sm text-red-500">
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
.input-no-outline {
  outline: none !important;
}
.input-no-outline:focus {
  outline: none !important;
}
</style>
