<template>
  <!-- 筛选抽屉 -->
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50"
    @click="$emit('close')"
  >
    <div
      class="bg-white dark:bg-gray-800 w-full max-w-sm h-full flex flex-col shadow-xl transform transition-transform"
      @click.stop
    >
      <!-- 标题栏 -->
      <div
        class="px-4 py-3 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center"
      >
        <h3 class="text-lg font-semibold text-green-950 dark:text-white">
          筛选条件
        </h3>
        <button
          @click="$emit('close')"
          class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded transition-colors"
        >
          <XMarkIcon class="w-4 h-4" />
        </button>
      </div>

      <!-- 筛选表单 -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <!-- 日期范围 -->
        <div class="space-y-2">
          <DatePicker
            v-model="localQuery.startDay"
            label="开始日期"
            placeholder="请选择开始日期"
            clearable
          />
        </div>

        <div class="space-y-2">
          <DatePicker
            v-model="localQuery.endDay"
            label="结束日期"
            placeholder="请选择结束日期"
            clearable
          />
        </div>

        <!-- 流水归属 -->
        <div class="space-y-2">
          <label
            class="block text-sm font-semibold text-gray-600 dark:text-gray-400"
          >
            流水归属
          </label>
          <div class="relative">
            <input
              v-model="localQuery.attribution"
              type="text"
              placeholder="请输入流水归属..."
              class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-green-950 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
              @input="(filterAttributions(), attributionActiveIndex = 0)"
              @focus="(showAttributionDropdown = true, attributionActiveIndex = 0)"
              @blur="hideAttributionDropdown"
              @keydown="onAttributionKeydown($event)"
            />
            <!-- 下拉选项 -->
            <div
              v-if="showAttributionDropdown && filteredAttributions.length > 0"
              class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto"
            >
              <div
                v-for="(item, index) in filteredAttributions"
                :key="item"
                @mousedown="selectAttribution(item)"
                :class="[
                  'px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-gray-900 dark:text-gray-100',
                  index === attributionActiveIndex ? 'bg-gray-100 dark:bg-gray-600' : ''
                ]"
              >
                {{ item }}
              </div>
            </div>
          </div>
        </div>

        <!-- 名称 -->
        <div class="space-y-2">
          <label
            class="block text-sm font-semibold text-gray-600 dark:text-gray-400"
          >
            名称
          </label>
          <div class="relative">
            <input
              v-model="localQuery.name"
              type="text"
              placeholder="请输入名称..."
              class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-green-950 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
              @input="(filterNames(), nameActiveIndex = 0)"
              @focus="(showNameDropdown = true, nameActiveIndex = 0)"
              @blur="hideNameDropdown"
              @keydown="onNameKeydown($event)"
            />
            <!-- 下拉选项 -->
            <div
              v-if="showNameDropdown && filteredNames.length > 0"
              class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto"
            >
              <div
                v-for="(item, index) in filteredNames"
                :key="item"
                @mousedown="selectName(item)"
                :class="[
                  'px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-gray-900 dark:text-gray-100',
                  index === nameActiveIndex ? 'bg-gray-100 dark:bg-gray-600' : ''
                ]"
              >
                {{ item }}
              </div>
            </div>
          </div>
        </div>

        <!-- 备注 -->
        <div class="space-y-2">
          <label
            class="block text-sm font-semibold text-gray-600 dark:text-gray-400"
          >
            备注
          </label>
          <input
            v-model="localQuery.description"
            type="text"
            placeholder="请输入备注..."
            class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-green-950 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <!-- 流水类型 -->
        <div class="space-y-2">
          <label
            class="block text-sm font-semibold text-gray-600 dark:text-gray-400"
          >
            流水类型
          </label>
          <select
            v-model="localQuery.flowType"
            @change="onFlowTypeChange"
            class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-green-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">全部</option>
            <option value="支出">支出</option>
            <option value="收入">收入</option>
            <option value="不计收支">不计收支</option>
          </select>
        </div>

        <!-- 支出/收入类型 -->
        <div class="space-y-2">
          <label
            class="block text-sm font-semibold text-gray-600 dark:text-gray-400"
          >
            {{ industryTypeLabel }}
          </label>
          <div class="relative">
            <input
              v-model="localQuery.industryType"
              type="text"
              :placeholder="`请输入${industryTypeLabel}...`"
              class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-green-950 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
              @input="(filterIndustryTypes(), industryActiveIndex = 0)"
              @focus="(showIndustryTypeDropdown = true, industryActiveIndex = 0)"
              @blur="hideIndustryTypeDropdown"
              @keydown="onIndustryKeydown($event)"
            />
            <!-- 下拉选项 -->
            <div
              v-if="
                showIndustryTypeDropdown && filteredIndustryTypes.length > 0
              "
              class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto"
            >
              <div
                v-for="(item, index) in filteredIndustryTypes"
                :key="item"
                @mousedown="selectIndustryType(item)"
                :class="[
                  'px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-gray-900 dark:text-gray-100 flex items-center gap-2',
                  index === industryActiveIndex ? 'bg-gray-100 dark:bg-gray-600' : ''
                ]"
              >
                <svg
                  class="w-4 h-4 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                {{ item }}
              </div>
            </div>
          </div>
        </div>

        <!-- 支付/收款方式 -->
        <div class="space-y-2">
          <label
            class="block text-sm font-semibold text-gray-600 dark:text-gray-400"
          >
            {{ payTypeLabel }}
          </label>
          <div class="relative">
            <input
              v-model="localQuery.payType"
              type="text"
              :placeholder="`请输入${payTypeLabel}...`"
              class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-green-950 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
              @input="(filterPayTypes(), payTypeActiveIndex = 0)"
              @focus="(showPayTypeDropdown = true, payTypeActiveIndex = 0)"
              @blur="hidePayTypeDropdown"
              @keydown="onPayTypeKeydown($event)"
            />
            <!-- 下拉选项 -->
            <div
              v-if="showPayTypeDropdown && filteredPayTypes.length > 0"
              class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto"
            >
              <div
                v-for="(item, index) in filteredPayTypes"
                :key="item"
                @mousedown="selectPayType(item)"
                :class="[
                  'px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-gray-900 dark:text-gray-100 flex items-center gap-2',
                  index === payTypeActiveIndex ? 'bg-gray-100 dark:bg-gray-600' : ''
                ]"
              >
                <CreditCardIcon class="w-4 h-4 text-blue-500" />
                {{ item }}
              </div>
            </div>
          </div>
        </div>

        <!-- 金额范围 -->
        <div class="space-y-2">
          <label
            class="block text-sm font-semibold text-gray-600 dark:text-gray-400"
          >
            最小金额
          </label>
          <input
            v-model="localQuery.minMoney"
            type="number"
            step="0.01"
            placeholder="0.00"
            class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-green-950 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div class="space-y-2">
          <label
            class="block text-sm font-semibold text-gray-600 dark:text-gray-400"
          >
            最大金额
          </label>
          <input
            v-model="localQuery.maxMoney"
            type="number"
            step="0.01"
            placeholder="0.00"
            class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-green-950 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      <!-- 操作栏 -->
      <div
        class="px-4 py-3 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30"
      >
        <div class="flex gap-2">
          <button
            @click="resetFilters"
            class="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded text-sm font-semibold transition-colors"
          >
            重置
          </button>
          <button
            @click="applyFilters"
            class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-semibold transition-colors flex items-center justify-center gap-1"
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
import {
  XMarkIcon,
  CheckIcon,
  CreditCardIcon,
} from "@heroicons/vue/24/outline";
import DatePicker from "@/components/ui/DatePicker.vue";
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

// 下拉选项显示状态
const showNameDropdown = ref(false);
const showAttributionDropdown = ref(false);
const showIndustryTypeDropdown = ref(false);
const showPayTypeDropdown = ref(false);

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

// 过滤后的选项
const filteredNames = computed(() => {
  if (!localQuery.value.name || !props.nameList) return props.nameList || [];
  return props.nameList.filter((item) =>
    item.toLowerCase().includes(localQuery.value.name!.toLowerCase())
  );
});

const filteredAttributions = computed(() => {
  if (!localQuery.value.attribution || !props.attributionList)
    return props.attributionList || [];
  return props.attributionList.filter((item) =>
    item.toLowerCase().includes(localQuery.value.attribution!.toLowerCase())
  );
});

const filteredIndustryTypes = computed(() => {
  if (!localQuery.value.industryType) return industryTypeOptions.value;
  return industryTypeOptions.value.filter((item) =>
    item.toLowerCase().includes(localQuery.value.industryType!.toLowerCase())
  );
});

const filteredPayTypes = computed(() => {
  if (!localQuery.value.payType) return payTypeOptions.value;
  return payTypeOptions.value.filter((item) =>
    item.toLowerCase().includes(localQuery.value.payType!.toLowerCase())
  );
});

// 监听外部查询变化
watch(
  () => props.query,
  (newQuery) => {
    localQuery.value = { ...newQuery };
  },
  { deep: true }
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
  // 清空相关字段
  localQuery.value.industryType = "";
  localQuery.value.payType = "";
};

// 过滤方法
const filterNames = () => {
  showNameDropdown.value = true;
};

const filterAttributions = () => {
  showAttributionDropdown.value = true;
};

const filterIndustryTypes = () => {
  showIndustryTypeDropdown.value = true;
};

const filterPayTypes = () => {
  showPayTypeDropdown.value = true;
};

// 选择方法
const selectName = (name: string) => {
  localQuery.value.name = name;
  showNameDropdown.value = false;
};

const selectAttribution = (attribution: string) => {
  localQuery.value.attribution = attribution;
  showAttributionDropdown.value = false;
};

const selectIndustryType = (type: string) => {
  localQuery.value.industryType = type;
  showIndustryTypeDropdown.value = false;
};

const selectPayType = (type: string) => {
  localQuery.value.payType = type;
  showPayTypeDropdown.value = false;
};

// 隐藏下拉框方法（延迟隐藏以便点击选择）
const hideNameDropdown = () => {
  setTimeout(() => {
    showNameDropdown.value = false;
  }, 150);
};

const hideAttributionDropdown = () => {
  setTimeout(() => {
    showAttributionDropdown.value = false;
  }, 150);
};

const hideIndustryTypeDropdown = () => {
  setTimeout(() => {
    showIndustryTypeDropdown.value = false;
  }, 150);
};

const hidePayTypeDropdown = () => {
  setTimeout(() => {
    showPayTypeDropdown.value = false;
  }, 150);
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

// 键盘导航：活动索引（响应式）
const nameActiveIndex = ref(0);
const attributionActiveIndex = ref(0);
const industryActiveIndex = ref(0);
const payTypeActiveIndex = ref(0);

const clampIndex = (index: number, length: number) => {
  if (length <= 0) return -1;
  if (index < 0) return length - 1;
  if (index >= length) return 0;
  return index;
};

const onNameKeydown = (e: KeyboardEvent) => {
  const list = filteredNames.value;
  if (!showNameDropdown.value && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
    showNameDropdown.value = true;
  }
  if (e.key === "ArrowDown") {
    e.preventDefault();
    nameActiveIndex.value = clampIndex(nameActiveIndex.value + 1, list.length);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    nameActiveIndex.value = clampIndex(nameActiveIndex.value - 1, list.length);
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (nameActiveIndex.value >= 0 && nameActiveIndex.value < list.length) {
      selectName(list[nameActiveIndex.value]);
    }
  } else if (e.key === "Escape") {
    showNameDropdown.value = false;
  }
};

const onAttributionKeydown = (e: KeyboardEvent) => {
  const list = filteredAttributions.value;
  if (!showAttributionDropdown.value && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
    showAttributionDropdown.value = true;
  }
  if (e.key === "ArrowDown") {
    e.preventDefault();
    attributionActiveIndex.value = clampIndex(attributionActiveIndex.value + 1, list.length);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    attributionActiveIndex.value = clampIndex(attributionActiveIndex.value - 1, list.length);
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (attributionActiveIndex.value >= 0 && attributionActiveIndex.value < list.length) {
      selectAttribution(list[attributionActiveIndex.value]);
    }
  } else if (e.key === "Escape") {
    showAttributionDropdown.value = false;
  }
};

const onIndustryKeydown = (e: KeyboardEvent) => {
  const list = filteredIndustryTypes.value;
  if (!showIndustryTypeDropdown.value && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
    showIndustryTypeDropdown.value = true;
  }
  if (e.key === "ArrowDown") {
    e.preventDefault();
    industryActiveIndex.value = clampIndex(industryActiveIndex.value + 1, list.length);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    industryActiveIndex.value = clampIndex(industryActiveIndex.value - 1, list.length);
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (industryActiveIndex.value >= 0 && industryActiveIndex.value < list.length) {
      selectIndustryType(list[industryActiveIndex.value]);
    }
  } else if (e.key === "Escape") {
    showIndustryTypeDropdown.value = false;
  }
};

const onPayTypeKeydown = (e: KeyboardEvent) => {
  const list = filteredPayTypes.value;
  if (!showPayTypeDropdown.value && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
    showPayTypeDropdown.value = true;
  }
  if (e.key === "ArrowDown") {
    e.preventDefault();
    payTypeActiveIndex.value = clampIndex(payTypeActiveIndex.value + 1, list.length);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    payTypeActiveIndex.value = clampIndex(payTypeActiveIndex.value - 1, list.length);
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (payTypeActiveIndex.value >= 0 && payTypeActiveIndex.value < list.length) {
      selectPayType(list[payTypeActiveIndex.value]);
    }
  } else if (e.key === "Escape") {
    showPayTypeDropdown.value = false;
  }
};
</script>

<style scoped>
/* 自定义滚动条样式 */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  @apply bg-gray-100 dark:bg-gray-700;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  @apply bg-gray-300 dark:bg-gray-600 rounded-full;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400 dark:bg-gray-500;
}
</style>
