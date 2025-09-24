<template>
  <!-- 流水编辑对话框 -->
  <div
    v-if="showFlowEditDialog"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
    style="z-index: 999"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-auto"
      @click.stop
    >
      <!-- 标题栏 -->
      <div
        class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"
      >
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ title }}
        </h3>
        <button
          @click="closeDialog"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>

      <!-- 表单内容 -->
      <div class="p-2 md:p-4 space-y-2 max-h-[80vh] overflow-y-auto">
        <!-- 日期选择 -->
        <div>
          <label
            class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1"
          >
            日期
          </label>
          <UiDatePicker v-model="flowEdit.day" class="w-full" />
        </div>

        <!-- 流水类型 -->
        <div>
          <label
            class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1"
          >
            流水类型
          </label>
          <select
            v-model="flowEdit.flowType"
            @change="changeFlowTypes"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">请选择流水类型</option>
            <option
              v-for="type in flowTypeDialogOptions"
              :key="type"
              :value="type"
            >
              {{ type }}
            </option>
          </select>
        </div>

        <!-- 支出类型/收入类型 -->
        <div>
          <label
            class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1"
          >
            {{ industryTypeLabel }}
          </label>
          <div class="relative">
            <input
              v-model="flowEdit.industryType"
              @input="(industryTypeSearchText = flowEdit.industryType, showIndustryTypeDropdown = true, industryActiveIndex = 0)"
              @focus="(showIndustryTypeDropdown = true, industryActiveIndex = 0)"
              @blur="hideIndustryTypeDropdown"
              @keydown="onIndustryKeydown($event)"
              placeholder="输入或选择类型"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <!-- 下拉选项 -->
            <div
              v-if="
                showIndustryTypeDropdown &&
                filteredIndustryTypeOptions.length > 0
              "
              class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto"
            >
              <div
                v-for="(item, index) in filteredIndustryTypeOptions"
                :key="item"
                @mousedown="selectIndustryType(item)"
                :class="[
                  'px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-sm text-gray-900 dark:text-white',
                  index === industryActiveIndex ? 'bg-gray-100 dark:bg-gray-600' : ''
                ]"
              >
                {{ item }}
              </div>
            </div>
          </div>
        </div>

        <!-- 支付方式/收款方式 -->
        <div>
          <label
            class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1"
          >
            {{ payTypeLabel }}
          </label>
          <div class="relative">
            <input
              v-model="flowEdit.payType"
              @input="(payTypeSearchText = flowEdit.payType, showPayTypeDropdown = true, payTypeActiveIndex = 0)"
              @focus="(showPayTypeDropdown = true, payTypeActiveIndex = 0)"
              @blur="hidePayTypeDropdown"
              @keydown="onPayTypeKeydown($event)"
              placeholder="输入或选择支付方式"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <!-- 下拉选项 -->
            <div
              v-if="showPayTypeDropdown && filteredPayTypeOptions.length > 0"
              class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto"
            >
              <div
                v-for="(item, index) in filteredPayTypeOptions"
                :key="item"
                @mousedown="selectPayType(item)"
                :class="[
                  'px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-sm text-gray-900 dark:text-white',
                  index === payTypeActiveIndex ? 'bg-gray-100 dark:bg-gray-600' : ''
                ]"
              >
                {{ item }}
              </div>
            </div>
          </div>
        </div>

        <!-- 金额 -->
        <div>
          <label
            class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1"
          >
            金额
          </label>
          <input
            v-model="flowEdit.money"
            type="number"
            step="0.01"
            placeholder="请输入金额"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <!-- 流水归属 -->
        <div>
          <label
            class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1"
          >
            流水归属
          </label>
          <div class="relative">
            <input
              v-model="flowEdit.attribution"
              @focus="(showAttributionDropdown = true, attributionActiveIndex = 0)"
              @blur="hideAttributionDropdown"
              @keydown="onAttributionKeydown($event)"
              placeholder="输入或选择归属"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <!-- 下拉选项 -->
            <div
              v-if="showAttributionDropdown && attributionList.length > 0"
              class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto"
            >
              <div
                v-for="(item, index) in attributionList"
                :key="item"
                @mousedown="selectAttribution(item)"
                :class="[
                  'px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-sm text-gray-900 dark:text-white',
                  index === attributionActiveIndex ? 'bg-gray-100 dark:bg-gray-600' : ''
                ]"
              >
                {{ item }}
              </div>
            </div>
          </div>
        </div>

        <!-- 流水名称 -->
        <div>
          <label
            class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1"
          >
            流水名称
          </label>
          <div class="relative">
            <input
              v-model="flowEdit.name"
              @focus="(showNameDropdown = true, nameActiveIndex = 0)"
              @blur="hideNameDropdown"
              @keydown="onNameKeydown($event)"
              placeholder="输入或选择名称"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <!-- 下拉选项 -->
            <div
              v-if="showNameDropdown && nameList.length > 0"
              class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto"
            >
              <div
                v-for="(item, index) in nameList"
                :key="item"
                @mousedown="selectName(item)"
                :class="[
                  'px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-sm text-gray-900 dark:text-white line-clamp-1',
                  index === nameActiveIndex ? 'bg-gray-100 dark:bg-gray-600' : ''
                ]"
              >
                {{ item }}
              </div>
            </div>
          </div>
        </div>

        <!-- 备注 -->
        <div>
          <label
            class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1"
          >
            备注
          </label>
          <textarea
            v-model="flowEdit.description"
            rows="3"
            placeholder="请输入备注"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          ></textarea>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div
        class="flex justify-center gap-3 p-4 border-t border-gray-200 dark:border-gray-700"
      >
        <button
          @click="closeDialog"
          class="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          取消
        </button>
        <button
          @click="confirmForm(false)"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          确定
        </button>
        <button
          v-if="formTitle[0] === title"
          @click="confirmForm(true)"
          class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          确定并继续
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { showFlowEditDialog } from "~/utils/flag";
import { onMounted, ref, computed } from "vue";
import { getIndustryType, getPayType } from "~/utils/apis";
import { XMarkIcon } from "@heroicons/vue/24/outline";

// ESC键监听
useEscapeKey(() => {
  if (showFlowEditDialog.value) {
    closeDialog();
  }
}, showFlowEditDialog);

const { title, flow, successCallback } = defineProps([
  "title",
  "flow",
  "successCallback",
]);

// 表单弹窗标题选项
const formTitle = ["新增流水", "修改流水"];
const industryTypeLabel = ref("支出类型/收入类型");
const payTypeLabel = ref("支付方式/收款方式");
const flowTypeDialogOptions = ref(["支出", "收入", "不计收支"]);

// 下拉框显示状态
const showIndustryTypeDropdown = ref(false);
const showPayTypeDropdown = ref(false);
const showAttributionDropdown = ref(false);
const showNameDropdown = ref(false);

// 支出类型/收入类型
const industryTypeOptions = ref<any[]>([]);
// 支付类型
const payTypeOptions = ref<any[]>([]);
const flowEdit = ref<Flow | any>({
  flowType: "",
});

const nameList = ref<string[]>([]);
const getNames = async () => {
  const res = await doApi.post<string[]>("api/entry/flow/getNames", {
    bookId: localStorage.getItem("bookId"),
  });
  nameList.value = res;
};
getNames();

const attributionList = ref<string[]>([]);
const getAttributions = async () => {
  const res = await doApi.post<string[]>("api/entry/flow/getAttributions", {
    bookId: localStorage.getItem("bookId"),
  });
  attributionList.value = res;
};
getAttributions();

onMounted(() => {
  console.log("flow", flow);
  if (flow) {
    flowEdit.value = { ...flow };
    if (flowEdit.value.day) {
      flowEdit.value.day = flowEdit.value.day;
    }
  }
});

// 修改FlowType后联动
const changeFlowTypes = () => {
  if (flowEdit.value.flowType === "支出") {
    industryTypeLabel.value = "支出类型";
    payTypeLabel.value = "支付方式";
  } else if (flowEdit.value.flowType === "收入") {
    industryTypeLabel.value = "收入类型";
    payTypeLabel.value = "收款方式";
  } else {
    industryTypeLabel.value = "支出类型/收入类型";
    payTypeLabel.value = "支付方式/收款方式";
  }

  getIndustryType(flowEdit.value.flowType || "").then((data) => {
    industryTypeOptions.value = data.map((d) => {
      return d.industryType;
    });
  });
  getPayType(flowEdit.value.flowType || "").then((data) => {
    payTypeOptions.value = data.map((d) => {
      return d.payType;
    });
  });
};
changeFlowTypes();

// 添加筛选相关的响应式变量
const industryTypeSearchText = ref("");
const payTypeSearchText = ref("");

// 计算属性：筛选后的选项
const filteredIndustryTypeOptions = computed(() => {
  if (!industryTypeSearchText.value) {
    return industryTypeOptions.value;
  }
  return industryTypeOptions.value.filter((item) =>
    item.toLowerCase().includes(industryTypeSearchText.value.toLowerCase())
  );
});

const filteredPayTypeOptions = computed(() => {
  if (!payTypeSearchText.value) {
    return payTypeOptions.value;
  }
  return payTypeOptions.value.filter((item) =>
    item.toLowerCase().includes(payTypeSearchText.value.toLowerCase())
  );
});

// 键盘导航：活动索引（响应式）
const industryActiveIndex = ref(0);
const payTypeActiveIndex = ref(0);
const attributionActiveIndex = ref(0);
const nameActiveIndex = ref(0);

const clampIndex = (index: number, length: number) => {
  if (length <= 0) return -1;
  if (index < 0) return length - 1;
  if (index >= length) return 0;
  return index;
};

const onIndustryKeydown = (e: KeyboardEvent) => {
  const list = filteredIndustryTypeOptions.value;
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
  const list = filteredPayTypeOptions.value;
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

const onAttributionKeydown = (e: KeyboardEvent) => {
  const list = attributionList.value;
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

const onNameKeydown = (e: KeyboardEvent) => {
  const list = nameList.value;
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

// 下拉框处理方法
const hideIndustryTypeDropdown = () => {
  setTimeout(() => {
    showIndustryTypeDropdown.value = false;
  }, 200);
};

const hidePayTypeDropdown = () => {
  setTimeout(() => {
    showPayTypeDropdown.value = false;
  }, 200);
};

const hideAttributionDropdown = () => {
  setTimeout(() => {
    showAttributionDropdown.value = false;
  }, 200);
};

const hideNameDropdown = () => {
  setTimeout(() => {
    showNameDropdown.value = false;
  }, 200);
};

const selectIndustryType = (item: string) => {
  flowEdit.value.industryType = item;
  showIndustryTypeDropdown.value = false;
};

const selectPayType = (item: string) => {
  flowEdit.value.payType = item;
  showPayTypeDropdown.value = false;
};

const selectAttribution = (item: string) => {
  flowEdit.value.attribution = item;
  showAttributionDropdown.value = false;
};

const selectName = (item: string) => {
  flowEdit.value.name = item;
  showNameDropdown.value = false;
};

// 提交表单（新增或修改）
const confirmForm = async (again: boolean) => {
  if (!flowEdit.value.flowType || !flowEdit.value.money) {
    Alert.error("请填写必要信息");
    return;
  }
  if (flowEdit.value.id) {
    // 修改
    updateOne();
  } else {
    // 新增
    createOne(again);
  }
};

// 创建
const createOne = (again: boolean) => {
  doApi
    .post<Flow>("api/entry/flow/add", {
      bookId: localStorage.getItem("bookId") || "",
      day: flowEdit.value.day || new Date().toISOString().split("T")[0],
      flowType: flowEdit.value.flowType,
      industryType: flowEdit.value.industryType,
      payType: flowEdit.value.payType,
      name: flowEdit.value.name,
      money: Number(flowEdit.value.money),
      description: flowEdit.value.description,
      attribution: flowEdit.value.attribution,
    })
    .then((res) => {
      if (res.id) {
        successCallback(res);
        Alert.success("新增成功!");
        showFlowEditDialog.value = again;
        // 清空名称、备注和金额
        if (again) {
          flowEdit.value.money = undefined;
          flowEdit.value.name = undefined;
          flowEdit.value.description = undefined;
        }
      }
    })
    .catch(() => {
      Alert.error("新增出现异常");
    });
};

// 更新
const updateOne = () => {
  if (!flowEdit.value.id) {
    Alert.error("请选择要修改的数据");
    return;
  }
  doApi
    .post<Flow>("api/entry/flow/update", {
      id: flowEdit.value.id,
      day: flowEdit.value.day || new Date().toISOString().split("T")[0],
      bookId: localStorage.getItem("bookId") || "",
      flowType: flowEdit.value.flowType,
      industryType: flowEdit.value.industryType,
      money: Number(flowEdit.value.money),
      payType: flowEdit.value.payType,
      name: flowEdit.value.name,
      description: flowEdit.value.description,
      attribution: flowEdit.value.attribution,
    })
    .then((res) => {
      if (res.id) {
        successCallback(res);
        Alert.success("更新成功!");
        showFlowEditDialog.value = false;
      }
    })
    .catch((err) => {
      console.log(err);
      Alert.error("更新出现异常" + err.message);
    });
};

const closeDialog = () => {
  showFlowEditDialog.value = false;
};
</script>
