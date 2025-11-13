<template>
  <div>
    <!-- 桌面端统计信息 -->
    <div class="grid grid-cols-4 gap-1 md:gap-4">
      <div
        class="bg-green-50 dark:bg-green-900/20 rounded-lg p-1.5 md:p-3 border border-green-200 dark:border-green-800"
      >
        <div class="flex items-center justify-between">
          <div>
            <p
              class="text-xs md:text-sm font-base text-green-800 dark:text-green-300"
            >
              总收入
            </p>
            <p
              class="text-xs md:text-lg font-medium text-green-600 dark:text-green-400"
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
              class="text-xs md:text-sm font-base text-red-800 dark:text-red-300"
            >
              总支出
            </p>
            <p
              class="text-xs md:text-lg font-medium text-red-600 dark:text-red-400"
            >
              {{ Number(statistics?.totalOut || 0).toFixed(2) }}
            </p>
          </div>
          <MinusIcon class="w-4 h-4 md:w-8 md:h-8 text-red-500" />
        </div>
      </div>

      <div
        class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-1.5 md:p-3 border border-blue-200 dark:border-blue-800"
      >
        <div class="flex items-center justify-between">
          <div>
            <p
              class="text-xs md:text-sm font-base text-blue-800 dark:text-blue-300"
            >
              净收入
            </p>
            <p
              class="text-xs md:text-lg font-medium text-blue-600 dark:text-blue-400"
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
        class="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-1.5 md:p-3 border border-gray-200 dark:border-gray-800"
      >
        <div class="flex items-center justify-between">
          <div>
            <p
              class="text-xs md:text-sm font-base text-gray-800 dark:text-gray-300"
            >
              不计收支
            </p>
            <p
              class="text-xs md:text-lg font-medium text-gray-600 dark:text-gray-400"
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
