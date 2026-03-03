<template>
  <div>
    <!-- 桌面端统计信息 -->
    <div class="grid grid-cols-4 gap-1 md:gap-4">
      <div
        class="bg-brand-50 dark:bg-brand-900/20 rounded-lg p-1.5 md:p-3 border border-frame-light dark:border-frame-dark"
      >
        <div class="flex items-center justify-between">
          <div>
            <p
              class="text-xs md:text-sm font-base text-brand-700 dark:text-brand-300"
            >
              总收入
            </p>
            <p
              class="text-xs md:text-lg font-medium text-brand-600 dark:text-brand-300"
            >
              {{ Number(statistics?.totalIn || 0).toFixed(2) }}
            </p>
          </div>
          <PlusIcon class="w-4 h-4 md:w-8 md:h-8 text-green-500" />
        </div>
      </div>

      <div
        class="bg-red-50 dark:bg-red-900/20 rounded-lg p-1.5 md:p-3 border border-red-200 dark:border-red-800"
      >
        <div class="flex items-center justify-between">
          <div>
            <p
              class="text-xs md:text-sm font-base text-state-danger dark:text-state-danger"
            >
              总支出
            </p>
            <p
              class="text-xs md:text-lg font-medium text-state-danger dark:text-state-danger"
            >
              {{ Number(statistics?.totalOut || 0).toFixed(2) }}
            </p>
          </div>
          <MinusIcon class="w-4 h-4 md:w-8 md:h-8 text-red-500" />
        </div>
      </div>

      <div
        class="bg-brand-50 dark:bg-brand-900/20 rounded-lg p-1.5 md:p-3 border border-frame-light dark:border-frame-dark"
      >
        <div class="flex items-center justify-between">
          <div>
            <p
              class="text-xs md:text-sm font-base text-brand-700 dark:text-brand-300"
            >
              净收入
            </p>
            <p
              class="text-xs md:text-lg font-medium text-brand-600 dark:text-brand-300"
            >
              {{
                Number(
                  (statistics?.totalIn || 0) - (statistics?.totalOut || 0)
                ).toFixed(2)
              }}
            </p>
          </div>
          <ScaleIcon class="w-4 h-4 md:w-8 md:h-8 text-blue-500" />
        </div>
      </div>

      <div
        class="bg-surface-soft dark:bg-surface-darkMuted rounded-lg p-1.5 md:p-3 border border-frame-light dark:border-frame-dark"
      >
        <div class="flex items-center justify-between">
          <div>
            <p
              class="text-xs md:text-sm font-base text-ink-secondary dark:text-ink-onDark"
            >
              不计收支
            </p>
            <p
              class="text-xs md:text-lg font-medium text-ink-secondary dark:text-ink-onDark"
            >
              {{ Number(statistics?.notInOut || 0).toFixed(2) }}
            </p>
          </div>
          <MinusCircleIcon class="w-4 h-4 md:w-8 md:h-8 text-gray-500" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  PlusIcon,
  MinusIcon,
  ScaleIcon,
  MinusCircleIcon,
} from "@heroicons/vue/24/outline";

interface Statistics {
  totalIn?: number;
  totalOut?: number;
  notInOut?: number;
}

interface Props {
  statistics?: Statistics;
}

defineProps<Props>();
</script>
