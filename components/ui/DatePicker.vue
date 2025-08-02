<template>
  <div class="date-picker-container">
    <label
      v-if="label"
      class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
    >
      {{ label }}
    </label>
    <div class="relative">
      <input
        ref="inputRef"
        type="text"
        :value="displayValue"
        :placeholder="placeholder"
        readonly
        @click="togglePicker"
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-green-950 dark:text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <div
        class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
      >
        <svg
          class="w-5 h-5 text-gray-400"
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
        class="absolute inset-y-0 right-8 flex items-center pr-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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
      class="absolute z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg"
      @click.stop
    >
      <VCalendar
        :locale="'zh'"
        :theme="isDark ? 'dark' : 'light'"
        @dayclick="onDateSelect"
        class="border-0"
      />
    </div>

    <!-- Backdrop -->
    <div
      v-if="showPicker"
      class="fixed inset-0 z-40"
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
