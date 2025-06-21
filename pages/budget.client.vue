<template>
  <div class="budget-container">
    <!-- Header with summary cards -->

    <!-- Budget progress bar -->
    <div class="tw-p-4">
      <div
        class="tw-flex tw-flex-col md:tw-flex-row md:tw-items-center tw-space-y-2 md:tw-space-x-4"
      >
        <div class="tw-flex tw-items-center tw-space-x-2">
          <span class="tw-text-xl">预算使用情况</span>
          <v-select
            v-model="selectedMonth"
            :items="monthOptions"
            label="选择月份"
            variant="outlined"
            density="compact"
            hide-details
            class="tw-w-40"
            @update:model-value="loadData"
          ></v-select>
        </div>
        <div class="tw-flex tw-items-center tw-space-x-2">
          <v-btn color="primary" size="small" @click="openBudgetDialog">
            设置预算
          </v-btn>
          <v-btn color="success" size="small" @click="reloadUsedAmount">
            刷新已用额度
          </v-btn>
        </div>
      </div>

      <div
        class="mt-2 tw-grid tw-grid-cols-2 md:tw-grid-cols-5 tw-gap-2 tw-p-2 md:tw-gap-4 md:tw-p-4"
      >
        <v-card class="tw-h-24 md:tw-h-32" color="blue-darken-4" theme="dark">
          <v-card-title class="tw-text-lg">月度预算总额</v-card-title>
          <v-card-text class="tw-text-center">
            <span class="tw-text-xl md:tw-text-3xl tw-font-bold">{{
              formatCurrency(totalBudget)
            }}</span>
          </v-card-text>
        </v-card>
        <v-card
          class="tw-h-24 md:tw-h-32"
          color="deep-orange-darken-4"
          theme="dark"
        >
          <v-card-title class="tw-text-lg">固定支出</v-card-title>
          <v-card-text class="tw-text-center">
            <span class="tw-text-xl md:tw-text-3xl tw-font-bold">{{
              formatCurrency(fixedFlowTotal)
            }}</span>
          </v-card-text>
        </v-card>

        <v-card class="tw-h-28 md:tw-h-32" color="primary" theme="dark">
          <v-card-title class="tw-text-lg">可用额度</v-card-title>
          <v-card-text class="tw-text-center">
            <div
              class="tw-flex tw-flex-col md:tw-flex-row tw-items-center tw-justify-center"
            >
              <span class="tw-text-xl md:tw-text-3xl tw-font-bold">{{
                formatCurrency(availableAmount)
              }}</span>
              <span class="tw-text-sm tw-ml-2"
                >({{ availablePercentage }}%)</span
              >
            </div>
          </v-card-text>
        </v-card>

        <v-card class="tw-h-28 md:tw-h-32" color="error" theme="dark">
          <v-card-title class="tw-text-lg">已用额度</v-card-title>
          <v-card-text class="tw-text-center">
            <div
              class="tw-flex tw-flex-col md:tw-flex-row tw-items-center tw-justify-center"
            >
              <span class="tw-text-xl md:tw-text-3xl tw-font-bold">{{
                formatCurrency(usedAmount)
              }}</span>
              <span class="tw-text-sm tw-ml-2">({{ usedPercentage }}%)</span>
            </div>
          </v-card-text>
        </v-card>
        <v-card class="tw-h-28 md:tw-h-32" color="success" theme="dark">
          <v-card-title class="tw-text-lg">剩余额度</v-card-title>
          <v-card-text class="tw-text-center">
            <div
              class="tw-flex tw-flex-col md:tw-flex-row tw-items-center tw-justify-center"
            >
              <span class="tw-text-xl md:tw-text-3xl tw-font-bold">{{
                formatCurrency(remainingAmount)
              }}</span>
              <span class="tw-text-sm tw-ml-2"
                >({{ remainingPercentage }}%)</span
              >
            </div>
          </v-card-text>
        </v-card>
      </div>
    </div>

    <!-- Fixed expenses section -->
    <div class="tw-p-4">
      <div class="tw-flex tw-items-center tw-space-x-4 tw-mb-4">
        <span class="tw-text-xl">固定支出管理</span>
        <v-btn color="success" size="small" @click="openFixedFlowDialog()">
          添加固定支出
        </v-btn>
      </div>
      <v-data-table
        :headers="headers"
        :items="fixedFlows"
        :loading="loading"
        class="elevation-1"
      >
        <template v-slot:item.money="{ item }">
          {{ formatCurrency(item.money || 0) }}
        </template>
        <template v-slot:item.actions="{ item }">
          <div class="tw-flex tw-space-x-2">
            <v-btn
              size="small"
              color="primary"
              icon
              variant="text"
              @click="openFixedFlowDialog(item)"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              size="small"
              color="error"
              icon
              variant="text"
              @click="deleteFixedFlow(item)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- Budget Dialog -->
    <v-dialog v-model="budgetDialog" max-width="500px">
      <v-card>
        <v-card-title>设置月度预算</v-card-title>
        <v-card-text>
          <v-form ref="budgetForm">
            <v-text-field
              v-model="editedBudget.budget"
              label="预算金额"
              type="number"
              variant="outlined"
              :rules="[(v) => !!v || '预算金额不能为空']"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" @click="budgetDialog = false">取消</v-btn>
          <v-btn color="success" @click="saveBudget">保存</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Fixed Flow Dialog -->
    <v-dialog v-model="fixedFlowDialog" max-width="500px">
      <v-card>
        <v-card-title
          >{{ editedFixedFlow.id ? "编辑" : "添加" }}固定支出</v-card-title
        >
        <v-card-text>
          <v-form ref="fixedFlowForm">
            <v-select
              v-model="editedFixedFlow.startMonth"
              :items="monthOptions"
              label="开始月份(包含)"
              variant="outlined"
              density="compact"
              :rules="[(v) => !!v || '结束月份不能为空']"
            ></v-select>
            <v-select
              v-model="editedFixedFlow.endMonth"
              :items="monthOptions"
              label="结束月份(包含)"
              variant="outlined"
              density="compact"
              :rules="[(v) => !!v || '结束月份不能为空']"
            ></v-select>

            <v-text-field
              v-model="editedFixedFlow.name"
              label="名称"
              variant="outlined"
              :rules="[(v) => !!v || '名称不能为空']"
              required
            ></v-text-field>

            <v-text-field
              v-model="editedFixedFlow.money"
              label="金额"
              type="number"
              variant="outlined"
              :rules="[(v) => !!v || '金额不能为空']"
              required
            ></v-text-field>

            <v-select
              v-model="editedFixedFlow.attribution"
              label="流水归属"
              :items="attributionList"
              variant="outlined"
            ></v-select>
            <!-- <v-select
              v-model="editedFixedFlow.flowType"
              label="流水类型"
              :items="flowTypeOptions"
              variant="outlined"
              :rules="[(v) => !!v || '流水类型不能为空']"
              required
            ></v-select>

            <v-select
              v-model="editedFixedFlow.industryType"
              label="行业分类"
              :items="industryTypeOptions"
              variant="outlined"
              :rules="[(v) => !!v || '行业分类不能为空']"
              required
            ></v-select>

            <v-select
              v-model="editedFixedFlow.payType"
              label="支付方式"
              :items="payTypeOptions"
              variant="outlined"
              :rules="[(v) => !!v || '支付方式不能为空']"
              required
            ></v-select> -->

            <v-textarea
              v-model="editedFixedFlow.description"
              label="备注"
              variant="outlined"
              rows="2"
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" @click="fixedFlowDialog = false">取消</v-btn>
          <v-btn color="success" @click="saveFixedFlow">保存</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirm Delete Dialog -->
    <v-dialog v-model="confirmDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title>确认删除</v-card-title>
        <v-card-text>
          您确定要删除这个固定支出吗？此操作不可撤销。
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="confirmDeleteDialog = false"
            >取消</v-btn
          >
          <v-btn color="error" @click="confirmDelete">删除</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
// 需要登录
definePageMeta({
  layout: "public",
  middleware: ["auth"],
});

const bookId = localStorage.getItem("bookId");

// Data
const loading = ref(false);
const selectedMonth = ref(getCurrentMonth());
const budgetSummary = ref<Budget>({});
const fixedFlows = ref<FixedFlow[]>([]);

// 预算总额
const totalBudget = computed(() => budgetSummary.value.budget || 0);

// 固定支出总额
const fixedFlowTotal = computed(() => {
  return fixedFlows.value.reduce(
    (total, item) => total + (Number(item.money) || 0),
    0
  );
});

// 可用额度
const availableAmount = computed(
  () => totalBudget.value - fixedFlowTotal.value
);

// 已用额度
const usedAmount = computed(() => budgetSummary.value.used || 0);

// 剩余额度
const remainingAmount = computed(
  () => availableAmount.value - usedAmount.value
);

// 已用额度百分比
const usedPercentage = computed(() => {
  return calculatePercentage(usedAmount.value, totalBudget.value);
});

// 可用额度百分比
const availablePercentage = computed(() => {
  return calculatePercentage(availableAmount.value, totalBudget.value);
});

// 剩余额度百分比
const remainingPercentage = computed(() => {
  return calculatePercentage(remainingAmount.value, totalBudget.value);
});

// Dialogs
const budgetDialog = ref(false);
const fixedFlowDialog = ref(false);
const confirmDeleteDialog = ref(false);

// Forms
const budgetForm = ref<any | null>();
const fixedFlowForm = ref<any | null>();

// Edited items
const editedBudget = ref({ budget: 0 });
const editedFixedFlow = ref<FixedFlow>({});
const itemToDelete = ref<FixedFlow | null>(null);

// Table headers
const headers = [
  { title: "月份", key: "month", sortable: false },
  { title: "金额", key: "money", sortable: false },
  { title: "名称", key: "name", sortable: false },
  { title: "备注", key: "description", sortable: false },
  // { title: "行业分类", key: "industryType", sortable: false },
  // { title: "支付方式", key: "payType", sortable: false },
  { title: "流水归属", key: "attribution", sortable: false },
  { title: "操作", key: "actions", sortable: false },
];

// Options for selects
const monthOptions = generateMonthOptions();
const attributionList = ref<string[]>([]);
const getAttributions = async () => {
  const res = await doApi.post<string[]>("api/entry/flow/getAttributions", {
    bookId: localStorage.getItem("bookId"),
  });
  attributionList.value = res;
};
getAttributions();

// Lifecycle hooks
onMounted(() => {
  loadData();
});

// Methods
function loadData() {
  if (!bookId) {
    Alert.error("请先选择账本");
    return;
  }

  loading.value = true;

  // 加载预算数据
  doApi
    .post<Budget[]>("api/entry/budget/list", {
      bookId: bookId,
      month: selectedMonth.value,
    })
    .then((res) => {
      if (res && res.length > 0) {
        budgetSummary.value = res[0];
      } else {
        budgetSummary.value = { budget: 0, used: 0 };
      }
    })
    .catch((err) => {
      console.error("Failed to load budget data:", err);
      Alert.error("加载预算数据失败");
    });

  // 加载固定支出数据
  doApi
    .post<FixedFlow[]>("api/entry/fixedFlow/list", {
      bookId: bookId,
      month: selectedMonth.value,
    })
    .then((res) => {
      fixedFlows.value = res || [];
    })
    .catch((err) => {
      console.error("Failed to load fixed flow data:", err);
      Alert.error("加载固定支出数据失败");
    })
    .finally(() => {
      loading.value = false;
    });
}

function openBudgetDialog() {
  editedBudget.value = {
    budget: budgetSummary.value.budget || 0,
  };
  budgetDialog.value = true;
}
const reloadUsedAmount = () => {
  doApi
    .post("api/entry/budget/reloadUsedAmount", {
      bookId: bookId,
      month: selectedMonth.value,
    })
    .then((res) => {
      Alert.success("已用额度刷新成功");
      loadData();
    });
};
function saveBudget() {
  if (!editedBudget.value.budget) {
    Alert.error("预算金额不能为空");
    return;
  }
  loading.value = true;

  const data = {
    bookId: bookId,
    month: selectedMonth.value,
    budget: Number(editedBudget.value.budget),
  };

  if (budgetSummary.value.id) {
    // Update existing budget
    doApi
      .post("api/entry/budget/update", {
        ...data,
        id: budgetSummary.value.id,
      })
      .then(() => {
        Alert.success("预算更新成功");
        budgetDialog.value = false;
        loadData();
      })
      .catch((err) => {
        console.error("Failed to update budget:", err);
        Alert.error("预算更新失败");
      })
      .finally(() => {
        loading.value = false;
      });
  } else {
    // Create new budget
    doApi
      .post("api/entry/budget/add", data)
      .then(() => {
        Alert.success("预算设置成功");
        budgetDialog.value = false;
        loadData();
      })
      .catch((err) => {
        console.error("Failed to add budget:", err);
        Alert.error("预算设置失败");
      })
      .finally(() => {
        loading.value = false;
      });
  }
}

function openFixedFlowDialog(item: FixedFlow | null = null) {
  if (item) {
    editedFixedFlow.value = { ...item };
  } else {
    editedFixedFlow.value = {};
  }
  fixedFlowDialog.value = true;
}

function saveFixedFlow() {
  if (!editedFixedFlow.value.money) {
    Alert.error("金额不能为空");
    return;
  }
  loading.value = true;

  const data = {
    ...editedFixedFlow.value,
    bookId: bookId,
    month: selectedMonth.value,
    money: Number(editedFixedFlow.value.money),
  };

  if (editedFixedFlow.value.id) {
    // Update existing fixed flow
    doApi
      .post("api/entry/fixedFlow/update", data)
      .then(() => {
        Alert.success("固定支出更新成功");
        fixedFlowDialog.value = false;
        loadData();
      })
      .catch((err) => {
        console.error("Failed to update fixed flow:", err);
        Alert.error("固定支出更新失败");
      })
      .finally(() => {
        loading.value = false;
      });
  } else {
    // Create new fixed flow
    doApi
      .post("api/entry/fixedFlow/add", data)
      .then(() => {
        Alert.success("固定支出添加成功");
        fixedFlowDialog.value = false;
        loadData();
      })
      .catch((err) => {
        console.error("Failed to add fixed flow:", err);
        Alert.error("固定支出添加失败");
      })
      .finally(() => {
        loading.value = false;
      });
  }
}

function deleteFixedFlow(item: FixedFlow) {
  itemToDelete.value = item;
  confirmDeleteDialog.value = true;
}

function confirmDelete() {
  if (!itemToDelete.value) return;

  loading.value = true;

  doApi
    .post("api/entry/fixedFlow/del", {
      id: itemToDelete.value.id,
      bookId: bookId,
    })
    .then(() => {
      Alert.success("固定支出删除成功");
      confirmDeleteDialog.value = false;
      loadData();
    })
    .catch((err) => {
      console.error("Failed to delete fixed flow:", err);
      Alert.error("固定支出删除失败");
    })
    .finally(() => {
      loading.value = false;
      itemToDelete.value = null;
    });
}

// Utility functions
function getCurrentMonth() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
}

function generateMonthOptions() {
  const options = [];
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  // Generate options for the current year and previous year
  for (let year = currentYear + 2; year >= currentYear - 1; year--) {
    for (let month = 12; month >= 1; month--) {
      const monthStr = String(month).padStart(2, "0");
      options.unshift({
        title: `${year}-${monthStr}`,
        value: `${year}-${monthStr}`,
      });
    }
  }

  return options;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: 2,
  }).format(value);
}

function calculatePercentage(used: number, total: number) {
  if (!total || total === 0) return 0;
  const percentage = (used / total) * 100;
  return Math.min(percentage, 100).toFixed(1);
}
</script>

<style scoped></style>
