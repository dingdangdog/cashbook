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
            v-model="flowEdit.industryType"
            :items="[]"
            :hide-no-data="false"
            ref="industryTypeCombobox"
            @update:search="industryTypeSearchText = $event"
          >
            <template v-slot:no-data>
              <div class="p-4 max-w-md">
                <div class="text-sm text-gray-600 mb-2">点击选择类型：</div>
                <div class="flex flex-wrap gap-2">
                  <v-chip
                    v-for="item in filteredIndustryTypeOptions"
                    :key="item"
                    variant="outlined"
                    color="green"
                    size="small"
                    class="cursor-pointer"
                    @click="selectIndustryType(item)"
                  >
                    <v-icon size="x-small" class="mr-1">mdi-sack</v-icon>
                    {{ item }}
                  </v-chip>
                </div>
              </div>
            </template>
            <template v-slot:selection="{ item }">
              <div class="flex items-center">
                <v-icon color="green" size="small" class="mr-1">
                  mdi-sack
                </v-icon>
                <span>{{ item.title }}</span>
              </div>
            </template>
          </v-combobox>
          <!-- 支付方式/收款方式 -->
          <v-combobox
            variant="outlined"
            :label="payTypeLabel"
            allow-new
            clearable
            v-model="flowEdit.payType"
            :items="[]"
            :hide-no-data="false"
            ref="payTypeCombobox"
            @update:search="payTypeSearchText = $event"
          >
            <template v-slot:no-data>
              <div class="p-4 max-w-md">
                <div class="text-sm text-gray-600 mb-2">点击选择支付方式：</div>
                <div class="flex flex-wrap gap-2">
                  <v-chip
                    v-for="item in filteredPayTypeOptions"
                    :key="item"
                    variant="outlined"
                    color="blue"
                    size="small"
                    class="cursor-pointer"
                    @click="selectPayType(item)"
                  >
                    <v-icon size="x-small" class="mr-1">mdi-credit-card</v-icon>
                    {{ item }}
                  </v-chip>
                </div>
              </div>
            </template>
            <template v-slot:selection="{ item }">
              <div class="flex items-center">
                <v-icon color="blue" size="small" class="mr-2">
                  mdi-credit-card
                </v-icon>
                <span>{{ item.title }}</span>
              </div>
            </template>
          </v-combobox>
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
                class="w-full p-2 cursor-pointer hover:bg-gray-200/10 duration-500 ease-in-out"
                @click="(props as any).onClick"
              >
                <p class="max-w-96 text-ellipsis line-clamp-1">
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
          class="flex items-center w-full justify-center space-x-4 pb-4"
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
import { onMounted, ref, watch, computed } from "vue";
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

// 添加筛选相关的响应式变量
const industryTypeSearchText = ref("");
const payTypeSearchText = ref("");

// 计算属性：筛选后的选项
const filteredIndustryTypeOptions = computed(() => {
  if (!industryTypeSearchText.value) {
    return industryTypeOptions.value;
  }
  return industryTypeOptions.value.filter(item =>
    item.toLowerCase().includes(industryTypeSearchText.value.toLowerCase())
  );
});

const filteredPayTypeOptions = computed(() => {
  if (!payTypeSearchText.value) {
    return payTypeOptions.value;
  }
  return payTypeOptions.value.filter(item =>
    item.toLowerCase().includes(payTypeSearchText.value.toLowerCase())
  );
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
      bookId: localStorage.getItem("bookId") || "",
      day: dateFormater("YYYY-MM-dd", flowEdit.value.day || new Date()),
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

const industryTypeCombobox = ref();
const payTypeCombobox = ref();

const selectIndustryType = (item: string) => {
  flowEdit.value.industryType = item;
  if (industryTypeCombobox.value) {
    industryTypeCombobox.value.blur();
  }
};

const selectPayType = (item: string) => {
  flowEdit.value.payType = item;
  if (payTypeCombobox.value) {
    payTypeCombobox.value.blur();
  }
};

const getTypeIcon = (title: string) => {
  // 支出类型图标映射
  const expenseIcons: Record<string, string> = {
    餐饮: "mdi-food",
    购物: "mdi-shopping",
    超市: "mdi-cart",
    生活用品: "mdi-home",
    服装: "mdi-tshirt-crew",
    交通: "mdi-bus",
    打车: "mdi-taxi",
    加油: "mdi-gas-station",
    停车: "mdi-parking",
    地铁: "mdi-subway",
    娱乐: "mdi-gamepad-variant",
    电影: "mdi-movie",
    旅游: "mdi-airplane",
    运动: "mdi-run",
    医疗: "mdi-hospital",
    药品: "mdi-pill",
    教育: "mdi-school",
    培训: "mdi-book-open",
    保险: "mdi-shield",
    理财: "mdi-chart-line",
    房租: "mdi-home-city",
    水电费: "mdi-lightning-bolt",
    通讯费: "mdi-phone",
    网费: "mdi-wifi",
  };

  // 收入类型图标映射
  const incomeIcons: Record<string, string> = {
    工资: "mdi-cash",
    奖金: "mdi-gift",
    兼职: "mdi-briefcase",
    理财收益: "mdi-trending-up",
    股票: "mdi-chart-line",
    基金: "mdi-bank",
    红包: "mdi-gift-outline",
    退款: "mdi-undo",
    借入: "mdi-hand-extended",
  };

  return expenseIcons[title] || incomeIcons[title] || "mdi-tag-outline";
};

const getTypeColor = (title: string) => {
  // 根据类型返回颜色
  const colorMap: Record<string, string> = {
    餐饮: "orange",
    购物: "pink",
    超市: "green",
    生活用品: "blue",
    服装: "purple",
    交通: "blue",
    打车: "yellow",
    加油: "red",
    停车: "grey",
    地铁: "blue",
    娱乐: "purple",
    电影: "red",
    旅游: "blue",
    运动: "green",
    医疗: "red",
    药品: "green",
    教育: "blue",
    培训: "orange",
    保险: "blue",
    理财: "green",
    房租: "brown",
    水电费: "yellow",
    通讯费: "blue",
    网费: "blue",
    工资: "green",
    奖金: "orange",
    兼职: "blue",
    理财收益: "green",
    股票: "red",
    基金: "blue",
    红包: "red",
    退款: "blue",
    借入: "orange",
  };

  return colorMap[title] || "grey";
};

const getTypeCategory = (title: string) => {
  // 根据类型返回分类标签
  const categoryMap: Record<string, string> = {
    餐饮: "生活",
    购物: "生活",
    超市: "生活",
    生活用品: "生活",
    服装: "生活",
    交通: "出行",
    打车: "出行",
    加油: "出行",
    停车: "出行",
    地铁: "出行",
    娱乐: "休闲",
    电影: "休闲",
    旅游: "休闲",
    运动: "休闲",
    医疗: "健康",
    药品: "健康",
    教育: "学习",
    培训: "学习",
    保险: "金融",
    理财: "金融",
    房租: "居住",
    水电费: "居住",
    通讯费: "居住",
    网费: "居住",
    工资: "收入",
    奖金: "收入",
    兼职: "收入",
    理财收益: "投资",
    股票: "投资",
    基金: "投资",
    红包: "其他",
    退款: "其他",
    借入: "其他",
  };

  return categoryMap[title] || "其他";
};

const getPayTypeIcon = (title: string) => {
  // 支付方式图标映射
  const payTypeIcons: Record<string, string> = {
    支付宝: "mdi-wallet",
    微信支付: "mdi-wechat",
    银行卡: "mdi-credit-card",
    现金: "mdi-cash",
    信用卡: "mdi-credit-card-outline",
    花呗: "mdi-flower",
    借呗: "mdi-hand-coin",
    白条: "mdi-receipt",
    余额宝: "mdi-piggy-bank",
    储蓄卡: "mdi-bank",
    转账: "mdi-bank-transfer",
    网银: "mdi-web",
    PayPal: "mdi-paypal",
    "Apple Pay": "mdi-apple",
    零钱: "mdi-coin",
    其他: "mdi-dots-horizontal",
  };

  return payTypeIcons[title] || "mdi-credit-card-outline";
};

const getPayTypeColor = (title: string) => {
  // 支付方式颜色映射
  const colorMap: Record<string, string> = {
    支付宝: "blue",
    微信支付: "green",
    银行卡: "indigo",
    现金: "orange",
    信用卡: "red",
    花呗: "blue",
    借呗: "purple",
    白条: "red",
    余额宝: "amber",
    储蓄卡: "teal",
    转账: "blue-grey",
    网银: "deep-purple",
    PayPal: "blue",
    "Apple Pay": "grey",
    零钱: "yellow",
    其他: "grey",
  };

  return colorMap[title] || "grey";
};

const getPayTypeCategory = (title: string) => {
  // 支付方式分类映射
  const categoryMap: Record<string, string> = {
    支付宝: "第三方",
    微信支付: "第三方",
    银行卡: "银行",
    现金: "现金",
    信用卡: "银行",
    花呗: "信贷",
    借呗: "信贷",
    白条: "信贷",
    余额宝: "理财",
    储蓄卡: "银行",
    转账: "银行",
    网银: "银行",
    PayPal: "第三方",
    "Apple Pay": "第三方",
    零钱: "现金",
    其他: "其他",
  };

  return categoryMap[title] || "其他";
};
</script>

<style scoped>
.edit-dialog-main {
  padding: 1rem 2rem 0rem 2rem !important;
}
</style>
