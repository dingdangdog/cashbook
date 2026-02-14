<template>
  <!-- 筛选抽屉 -->
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 flex justify-end z-50"
    @click="$emit('close')"
  >
    <div
      class="bg-surface text-foreground w-full max-w-sm h-full flex flex-col shadow-xl transform transition-transform border-l border-border"
      @click.stop
    >
      <!-- 标题栏 -->
      <div
        class="px-4 py-3 border-b border-border flex justify-between items-center"
      >
        <h3 class="text-base md:text-lg font-semibold">筛选条件</h3>
        <button
          @click="$emit('close')"
          class="text-foreground/50 hover:text-foreground/80 hover:bg-surface-muted p-1 rounded transition-colors"
        >
          <XMarkIcon class="w-4 h-4" />
        </button>
      </div>

      <!-- 筛选表单 -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <!-- 日期范围 -->
        <div class="space-y-2">
          <UiDatePicker
            v-model="localQuery.startDay"
            label="开始日期"
            placeholder="请选择开始日期"
            clearable
          />
        </div>

        <div class="space-y-2">
          <UiDatePicker
            v-model="localQuery.endDay"
            label="结束日期"
            placeholder="请选择结束日期"
            clearable
          />
        </div>

        <!-- 流水归属 -->
        <UiComboInput
          v-model="localQuery.attribution"
          label="流水归属"
          placeholder="请输入流水归属..."
          :options="attributionList || []"
        />

        <!-- 名称 -->
        <UiComboInput
          v-model="localQuery.name"
          label="名称"
          placeholder="请输入名称..."
          :options="nameList || []"
        />

        <!-- 备注 -->
        <UiTextInput
          v-model="localQuery.description"
          label="备注"
          placeholder="请输入备注..."
        />

        <!-- 流水类型 -->
        <UiComboInput
          v-model="localQuery.flowType"
          label="流水类型"
          placeholder="全部"
          :options="['支出', '收入', '不计收支']"
          @change="onFlowTypeChange"
        />

        <!-- 支出/收入类型 -->
        <UiComboInput
          v-model="localQuery.industryType"
          :label="industryTypeLabel"
          :placeholder="`请输入${industryTypeLabel}...`"
          :options="industryTypeOptions"
        />

        <!-- 支付/收款方式 -->
        <UiComboInput
          v-model="localQuery.payType"
          :label="payTypeLabel"
          :placeholder="`请输入${payTypeLabel}...`"
          :options="payTypeOptions"
        />

        <!-- 金额范围 -->
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-foreground/70">
            最小金额
          </label>
          <input
            v-model="localQuery.minMoney"
            type="number"
            step="0.01"
            placeholder="0.00"
            class="w-full px-3 py-2 text-sm border border-border rounded bg-background text-foreground placeholder-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-semibold text-foreground/70">
            最大金额
          </label>
          <input
            v-model="localQuery.maxMoney"
            type="number"
            step="0.01"
            placeholder="0.00"
            class="w-full px-3 py-2 text-sm border border-border rounded bg-background text-foreground placeholder-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <!-- 操作栏 -->
      <div class="px-4 py-3 border-t border-border bg-surface-muted">
        <div class="flex gap-2">
          <button
            @click="resetFilters"
            class="flex-1 px-4 py-2 bg-surface hover:bg-surface-muted text-foreground/80 rounded text-sm font-semibold transition-colors border border-border"
          >
            重置
          </button>
          <button
            @click="applyFilters"
            class="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded text-sm font-semibold transition-colors flex items-center justify-center gap-1"
          >
            <CheckIcon class="w-3 h-3" />
            应用筛选
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from "vue";
import { XMarkIcon, CheckIcon } from "@heroicons/vue/24/outline";
import { getIndustryType, getPayType } from "~/utils/apis";

interface FlowQuery {
  startDay?: string;
  endDay?: string;
  attribution?: string;
  name?: string;
  description?: string;
  flowType?: string;
  industryType?: string;
  payType?: string;
  minMoney?: number;
  maxMoney?: number;
}

interface Props {
  show: boolean;
  query: FlowQuery;
  nameList?: string[];
  attributionList?: string[];
}

const props = defineProps<Props>();

const localQuery = ref<FlowQuery>({ ...props.query });

// 选项列表
const industryTypeOptions = ref<string[]>([]);
const payTypeOptions = ref<string[]>([]);

// 标签文本
const industryTypeLabel = computed(() => {
  if (localQuery.value.flowType === "支出") return "支出类型";
  if (localQuery.value.flowType === "收入") return "收入类型";
  return "支出类型/收入类型";
});

const payTypeLabel = computed(() => {
  if (localQuery.value.flowType === "支出") return "支付方式";
  if (localQuery.value.flowType === "收入") return "收款方式";
  return "支付方式/收款方式";
});

// 监听外部查询变化
watch(
  () => props.query,
  (newQuery) => {
    localQuery.value = { ...newQuery };
  },
  { deep: true },
);

// 获取类型选项
const loadTypeOptions = async (flowType?: string) => {
  try {
    const [industryData, payData] = await Promise.all([
      getIndustryType(flowType || ""),
      getPayType(flowType || ""),
    ]);

    industryTypeOptions.value = industryData.map((d) => d.industryType);
    payTypeOptions.value = payData.map((d) => d.payType);
  } catch (error) {
    console.error("获取类型选项失败:", error);
  }
};

// 流水类型变更
const onFlowTypeChange = () => {
  loadTypeOptions(localQuery.value.flowType);
  localQuery.value.industryType = "";
  localQuery.value.payType = "";
};

const resetFilters = () => {
  localQuery.value = {};
  loadTypeOptions();
};

const applyFilters = () => {
  emit("apply", localQuery.value);
  emit("close");
};

const emit = defineEmits<{
  close: [];
  apply: [query: FlowQuery];
}>();

// 初始化加载类型选项
onMounted(() => {
  loadTypeOptions(localQuery.value.flowType);
});
</script>

<style scoped>
/* 自定义滚动条样式 */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background-color: rgb(var(--color-surface-muted));
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgb(var(--color-secondary-300));
  border-radius: 9999px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgb(var(--color-secondary-400));
}
</style>
