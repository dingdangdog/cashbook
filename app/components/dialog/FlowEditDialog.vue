<template>
  <!-- 流水编辑对话框 -->
  <div
    v-if="showFlowEditDialog"
    class="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
    style="z-index: 999"
  >
    <div
      class="bg-surface text-foreground rounded-lg shadow-xl w-full max-w-md mx-auto border border-border"
      @click.stop
    >
      <!-- 标题栏 -->
      <div
        class="flex items-center justify-between p-2 md:p-4 border-b border-border"
      >
        <h3 class="text-base md:text-lg font-semibold">
          {{ title }}
        </h3>
        <button
          @click="closeDialog"
          class="text-foreground/40 hover:text-foreground/70 transition-colors"
        >
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>

      <!-- 表单内容 -->
      <div class="p-2 md:p-4 space-y-2 max-h-[80vh] overflow-y-auto">
        <!-- 日期选择 -->
        <div>
          <label class="block text-sm font-semibold text-foreground/80 mb-1">
            日期
          </label>
          <UiDatePicker v-model="flowEdit.day" class="w-full" />
        </div>

        <!-- 流水类型 -->
        <UiComboInput
          v-model="flowEdit.flowType"
          label="流水类型"
          placeholder="请选择流水类型"
          :options="flowTypeDialogOptions"
          @change="changeFlowTypes"
        />

        <!-- 支出类型/收入类型 -->
        <UiComboInput
          v-model="flowEdit.industryType"
          :label="industryTypeLabel"
          placeholder="输入或选择类型"
          :options="industryTypeOptions"
        />

        <!-- 支付方式/收款方式 -->
        <UiComboInput
          v-model="flowEdit.payType"
          :label="payTypeLabel"
          placeholder="输入或选择支付方式"
          :options="payTypeOptions"
        />

        <!-- 交易账户 -->
        <div>
          <label class="block text-sm font-semibold text-foreground/80 mb-1">
            交易账户
          </label>
          <select
            v-model="flowEdit.accountId"
            class="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option :value="''">不关联账户</option>
            <option
              v-for="acc in accountOptions"
              :key="acc.id"
              :value="acc.id"
            >
              {{ acc.name }}
            </option>
          </select>
        </div>

        <!-- 金额 -->
        <div>
          <label class="block text-sm font-semibold text-foreground/80 mb-1">
            金额
          </label>
          <input
            v-model="flowEdit.money"
            type="number"
            step="0.01"
            placeholder="请输入金额"
            class="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-foreground/40 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <!-- 流水归属 -->
        <UiComboInput
          v-model="flowEdit.attribution"
          label="流水归属"
          placeholder="输入或选择归属"
          :options="attributionList"
        />

        <!-- 流水名称 -->
        <UiTextInput
          v-model="flowEdit.name"
          label="流水名称"
          placeholder="输入或选择名称"
        />

        <!-- 备注 -->
        <div>
          <label class="block text-sm font-semibold text-foreground/80 mb-1">
            备注
          </label>
          <textarea
            v-model="flowEdit.description"
            rows="3"
            placeholder="请输入备注"
            class="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-foreground/40 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          ></textarea>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div
        class="flex justify-center gap-3 p-4 border-t border-border bg-surface-muted"
      >
        <button
          @click="closeDialog"
          class="px-4 py-2 text-foreground/80 border border-border rounded-md hover:bg-surface transition-colors"
        >
          取消
        </button>
        <button
          @click="confirmForm(false)"
          class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          确定
        </button>
        <button
          v-if="formTitle[0] === title"
          @click="confirmForm(true)"
          class="px-4 py-2 bg-secondary-800 text-white rounded-md hover:bg-secondary-900 transition-colors"
        >
          确定并继续
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { showFlowEditDialog } from "~/utils/flag";
import { onMounted, ref } from "vue";
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

// 支出类型/收入类型
const industryTypeOptions = ref<any[]>([]);
// 支付类型
const payTypeOptions = ref<any[]>([]);
const accountOptions = ref<any[]>([]);
const flowEdit = ref<Flow | any>({
  flowType: "",
});

const attributionList = ref<string[]>([]);
const getAttributions = async () => {
  const res = await doApi.post<string[]>("api/entry/flow/getAttributions", {});
  attributionList.value = res;
};
getAttributions();

const loadAccounts = async () => {
  const res = await doApi.post<any[]>("api/entry/account/all", {
    status: 1,
  });
  accountOptions.value = Array.isArray(res) ? res : [];
};
loadAccounts();

onMounted(() => {
  // console.log("flow", flow);
  if (flow) {
    flowEdit.value = { ...flow };
    if (flowEdit.value.day) {
      flowEdit.value.day = flowEdit.value.day;
    }
  }
  if (formTitle[0] === title) {
    const day =
      (flow && (flow as any).day) || new Date().toISOString().split("T")[0];
    flowEdit.value = { flowType: "", day } as any;
  } else if (flow) {
    flowEdit.value = { ...flow } as any;
  }
  // 强制清除 id，确保新增不会走更新逻辑
  if (formTitle[0] === title && (flowEdit.value as any).id) {
    delete (flowEdit.value as any).id;
  }
  // 根据当前 flowType 联动标签与选项
  changeFlowTypes();
});

// 每次打开弹窗时，根据标题判定并重置表单，避免误把新增识别为修改

// 修改FlowType后联动
const changeFlowTypes = () => {
  if (flowEdit.value.flowType == "支出") {
    industryTypeLabel.value = "支出类型";
    payTypeLabel.value = "支付方式";
  } else if (flowEdit.value.flowType == "收入") {
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
      day: flowEdit.value.day || new Date().toISOString().split("T")[0],
      flowType: flowEdit.value.flowType,
      industryType: flowEdit.value.industryType,
      payType: flowEdit.value.payType,
      name: flowEdit.value.name,
      money: Number(flowEdit.value.money),
      accountId: flowEdit.value.accountId ? Number(flowEdit.value.accountId) : null,
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
      flowType: flowEdit.value.flowType,
      industryType: flowEdit.value.industryType,
      money: Number(flowEdit.value.money),
      accountId: flowEdit.value.accountId ? Number(flowEdit.value.accountId) : null,
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
