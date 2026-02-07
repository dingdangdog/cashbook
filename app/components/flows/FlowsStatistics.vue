<template>
  <div>
    <!-- 桌面端统计信息 -->
    <div class="grid grid-cols-4 gap-1 md:gap-4">
      <div
        class="bg-surface text-foreground rounded-lg p-1.5 md:p-3 border border-border"
      >
        <div class="flex items-center justify-between">
          <div>
            <p
              class="text-xs md:text-sm font-base text-foreground/70"
            >
              总收入
            </p>
            <p
              class="text-xs md:text-lg font-medium text-primary-600"
            >
              {{ Number(statistics?.totalIn || 0).toFixed(2) }}
            </p>
          </div>
          <PlusIcon class="w-4 h-4 md:w-8 md:h-8 text-primary-500" />
        </div>
      </div>

      <div
        class="bg-surface text-foreground rounded-lg p-1.5 md:p-3 border border-border"
      >
        <div class="flex items-center justify-between">
          <div>
            <p
              class="text-xs md:text-sm font-base text-foreground/70"
            >
              总支出
            </p>
            <p
              class="text-xs md:text-lg font-medium text-red-500"
            >
              {{ Number(statistics?.totalOut || 0).toFixed(2) }}
            </p>
          </div>
          <MinusIcon class="w-4 h-4 md:w-8 md:h-8 text-red-500" />
        </div>
      </div>

      <div
        class="bg-surface text-foreground rounded-lg p-1.5 md:p-3 border border-border"
      >
        <div class="flex items-center justify-between">
          <div>
            <p
              class="text-xs md:text-sm font-base text-foreground/70"
            >
              净收入
            </p>
            <p
              class="text-xs md:text-lg font-medium text-primary-600"
            >
              {{
                Number(
                  (statistics?.totalIn || 0) - (statistics?.totalOut || 0)
                ).toFixed(2)
              }}
            </p>
          </div>
          <ScaleIcon class="w-4 h-4 md:w-8 md:h-8 text-primary-500" />
        </div>
      </div>

      <div
        class="bg-surface text-foreground rounded-lg p-1.5 md:p-3 border border-border"
      >
        <div class="flex items-center justify-between">
          <div>
            <p
              class="text-xs md:text-sm font-base text-foreground/70"
            >
              不计收支
            </p>
            <p
              class="text-xs md:text-lg font-medium text-foreground/70"
            >
              {{ Number(statistics?.notInOut || 0).toFixed(2) }}
            </p>
          </div>
          <MinusCircleIcon class="w-4 h-4 md:w-8 md:h-8 text-foreground/40" />
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
