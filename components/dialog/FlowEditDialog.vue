<template>
  <!-- 弹出框表单：新增和修改通用 -->
  <v-dialog
    v-model="showFlowEditDialog"
    width="40rem"
    :fullscreen="miniFullscreen()"
  >
    <v-card>
      <v-card-title>{{ title }}</v-card-title>
      <v-card-text class="edit-dialog-main">
        <v-form v-model="editForm" ref="formRef">
          <!-- TODO 日期选择 -->
          <v-date-input
            label="日期"
            cancel-text="取消"
            ok-text="确定"
            clearable
            variant="outlined"
            v-model="day"
            :hide-actions="true"
            @update:modelValue="changeDay"
          ></v-date-input>
          <v-select
            variant="outlined"
            label="流水类型"
            v-model="flowEdit.flowType"
            :items="flowTypeDialogOptions"
            @update:modelValue="changeFlowTypes"
          ></v-select>
          <!-- 支出类型/收入类型 -->
          <v-combobox
            variant="outlined"
            :label="industryTypeLabel"
            allow-new
            clearable
            no-data-text="暂无数据，请输入"
            v-model="flowEdit.industryType"
            :items="industryTypeOptions"
          ></v-combobox>
          <!-- 支付方式/收款方式 -->
          <v-combobox
            variant="outlined"
            :label="payTypeLabel"
            allow-new
            clearable
            no-data-text="暂无数据，请输入"
            v-model="flowEdit.payType"
            :items="payTypeOptions"
          ></v-combobox>
          <v-text-field
            clearable
            label="金额"
            type="number"
            variant="outlined"
            v-model="flowEdit.money"
          ></v-text-field>
          <v-combobox
            clearable
            label="流水归属"
            variant="outlined"
            allow-new
            v-model="flowEdit.attribution"
            :items="attributionList"
          ></v-combobox>
          <v-combobox
            clearable
            allow-new
            label="流水名称"
            variant="outlined"
            v-model="flowEdit.name"
            :items="nameList"
          >
            <template v-slot:item="{ item, props }">
              <div
                class="w-full tw-p-2 tw-cursor-pointer hover:tw-bg-gray-200/10 tw-duration-500 tw-ease-in-out"
                @click="(props as any).onClick"
              >
                <p class="tw-max-w-96 tw-text-ellipsis tw-line-clamp-1">
                  {{ item.title }}
                </p>
              </div>
            </template>
          </v-combobox>
          <v-text-field
            clearable
            label="备注"
            variant="outlined"
            v-model="flowEdit.description"
          ></v-text-field>
        </v-form>
      </v-card-text>
      <!-- 表单确认按钮 -->
      <v-card-actions>
        <div
          class="tw-flex tw-items-center tw-w-full tw-justify-center tw-space-x-4 tw-pb-4"
        >
          <v-btn variant="elevated" color="error" @click="closeDialog()">
            取消
          </v-btn>
          <v-btn variant="elevated" color="primary" @click="confirmForm(false)">
            确定
          </v-btn>
          <v-btn
            variant="elevated"
            color="success"
            v-if="formTitle[0] === title"
            @click="confirmForm(true)"
          >
            确定并继续
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { VDateInput } from "vuetify/labs/VDateInput";
import { showFlowEditDialog } from "~/utils/flag";
import { dateFormater, miniFullscreen } from "@/utils/common";
import { onMounted, ref, watch } from "vue";
import { getIndustryType, getPayType } from "~/utils/apis";

const { title, flow, successCallback } = defineProps([
  "title",
  "flow",
  "successCallback",
]);

// 表单弹窗标题选项
const formTitle = ["新增流水", "修改流水"];
const industryTypeLabel = ref("支出类型/收入类型");
const payTypeLabel = ref("支付方式/收款方式");
const editForm = ref(false);
const flowTypeDialogOptions = ref(["支出", "收入", "不计收支"]);

// 支出类型/收入类型
const industryTypeOptions = ref<any[]>([]);
// 支付类型
const payTypeOptions = ref<any[]>([]);
const flowEdit = ref<Flow | any>({});

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
  if (flow) {
    flowEdit.value = flow;
    day.value = new Date(flowEdit.value.day || "");
  }
});
const day = ref();
const changeDay = () => {
  if (day.value) {
    // console.log(endDay.value)
    flowEdit.value.day = dateFormater("YYYY-MM-dd", day.value);
  }
};
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

const searchPayType = ref("");
const searchType = ref("");
watch(searchPayType, (val) => {
  // console.log(val)
  if (val && !industryTypeOptions.value.includes(val)) {
    industryTypeOptions.value.push(val);
  }
});
watch(searchType, (val) => {
  // console.log(val)
  if (val && !payTypeOptions.value.includes(val)) {
    payTypeOptions.value.push(val);
  }
});

// 提交表单（新增或修改）
const confirmForm = async (again: boolean) => {
  if (!editForm.value) {
    // formRef.validate()
    Alert.error("UnSubmit, Please Check Form!");
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
      day: dateFormater("YYYY-MM-dd", flowEdit.value.day || new Date()),
      bookId: localStorage.getItem("bookId") || "",
      flowType: flowEdit.value.flowType,
      industryType: flowEdit.value.industryType,
      money: Number(flowEdit.value.money),
      payType: flowEdit.value.payType,
      name: flowEdit.value.name,
      description: flowEdit.value.description,
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
      day: dateFormater("YYYY-MM-dd", flowEdit.value.day || new Date()),
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
      // console.log(res);
      if (res.id) {
        successCallback();
        Alert.success("更新成功!");
        showFlowEditDialog.value = false;
      }
    })
    .catch(() => {
      Alert.error("更新出现异常");
    });
};

const closeDialog = () => {
  showFlowEditDialog.value = false;
};
</script>

<style scoped>
.edit-dialog-main {
  padding: 1rem 2rem 0rem 2rem !important;
}
</style>
