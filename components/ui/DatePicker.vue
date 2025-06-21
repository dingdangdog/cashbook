<template>
  <div class="date-picker-container">
    <label
      v-if="label"
      class="tw-block tw-text-sm tw-font-medium tw-text-gray-700 dark:tw-text-gray-300 tw-mb-2"
    >
      {{ label }}
    </label>
    <div class="tw-relative">
      <input
        ref="inputRef"
        type="text"
        :value="displayValue"
        :placeholder="placeholder"
        readonly
        @click="togglePicker"
        class="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 dark:tw-border-gray-600 tw-rounded-md tw-shadow-sm tw-bg-white dark:tw-bg-gray-700 tw-text-gray-900 dark:tw-text-white tw-cursor-pointer focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-blue-500"
      />
      <div
        class="tw-absolute tw-inset-y-0 tw-right-0 tw-flex tw-items-center tw-pr-3 tw-pointer-events-none"
      >
        <svg
          class="tw-w-5 tw-h-5 tw-text-gray-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
            clip-rule="evenodd"
          />
        </svg>
      </div>

      <button
        v-if="clearable && modelValue"
        @click.stop="clearDate"
        class="tw-absolute tw-inset-y-0 tw-right-8 tw-flex tw-items-center tw-pr-1 tw-text-gray-400 hover:tw-text-gray-600 dark:hover:tw-text-gray-300"
      >
        <svg class="tw-w-4 tw-h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>

    <!-- Date Picker Popup -->
    <div
      v-if="showPicker"
      class="tw-absolute tw-z-50 tw-mt-1 tw-bg-white dark:tw-bg-gray-800 tw-border tw-border-gray-300 dark:tw-border-gray-600 tw-rounded-lg tw-shadow-lg"
      @click.stop
    >
      <VCalendar
        :locale="'zh'"
        :theme="isDark ? 'dark' : 'light'"
        @dayclick="onDateSelect"
        class="tw-border-0"
      />
    </div>

    <!-- Backdrop -->
    <div
      v-if="showPicker"
      class="tw-fixed tw-inset-0 tw-z-40"
      @click="closePicker"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";

interface Props {
  modelValue?: string | Date | null;
  label?: string;
  placeholder?: string;
  clearable?: boolean;
  format?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "请选择日期",
  clearable: true,
  format: "YYYY-MM-DD",
});

const emit = defineEmits<{
  "update:modelValue": [value: string | null];
  change: [value: string | null];
}>();

const inputRef = ref<HTMLInputElement>();
const showPicker = ref(false);
const selectedDate = ref<Date | null>(null);
const isDark = ref(false);

// 检测主题
onMounted(() => {
  const checkTheme = () => {
    isDark.value = document.documentElement.classList.contains("dark");
  };
  checkTheme();

  // 监听主题变化
  const observer = new MutationObserver(checkTheme);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  onUnmounted(() => {
    observer.disconnect();
  });
});

// 显示值
const displayValue = computed(() => {
  if (!props.modelValue) return "";

  const date =
    typeof props.modelValue === "string"
      ? new Date(props.modelValue)
      : props.modelValue;

  if (isNaN(date.getTime())) return "";

  return formatDate(date, props.format);
});

// 格式化日期
const formatDate = (date: Date, format: string): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return format
    .replace("YYYY", String(year))
    .replace("MM", month)
    .replace("DD", day);
};

// 监听modelValue变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      selectedDate.value =
        typeof newValue === "string" ? new Date(newValue) : newValue;
    } else {
      selectedDate.value = null;
    }
  },
  { immediate: true }
);

const togglePicker = () => {
  showPicker.value = !showPicker.value;
};

const closePicker = () => {
  showPicker.value = false;
};

const onDateSelect = (day: any) => {
  const date = day.date;
  selectedDate.value = date;

  const formattedDate = formatDate(date, props.format);
  emit("update:modelValue", formattedDate);
  emit("change", formattedDate);

  closePicker();
};

const clearDate = () => {
  selectedDate.value = null;
  emit("update:modelValue", null);
  emit("change", null);
};

// 点击外部关闭
const handleClickOutside = (event: Event) => {
  if (inputRef.value && !inputRef.value.contains(event.target as Node)) {
    closePicker();
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.date-picker-container {
  position: relative;
}

/* 自定义日历样式 */
:deep(.vc-container) {
  border: none !important;
  border-radius: 0.5rem;
}

:deep(.vc-header) {
  padding: 0.75rem;
}

:deep(.vc-weeks) {
  margin-top: 0.5rem;
  padding: 0 0.75rem 0.75rem;
}

:deep(.vc-day) {
  min-height: 2rem;
}

:deep(.vc-day-content) {
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
}

:deep(.vc-day-content:hover) {
  background-color: theme("colors.blue.100");
}

:deep(.dark .vc-day-content:hover) {
  background-color: theme("colors.blue.900");
}

:deep(.vc-day-content.vc-is-selected) {
  background-color: theme("colors.blue.500") !important;
  color: white !important;
}
</style>
