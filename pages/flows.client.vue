<template>
  <div class="flow-container">
    <!-- 表格查询框与操作按钮 -->
    <div class="flex space-x-2 justify-between p-2">
      <div class="flex space-x-2">
        <v-btn color="blue-grey-darken-1" @click="selectHeaderDialog = true"
          >导入导出
        </v-btn>
        <!-- <v-btn color="error" @click="toDeleteBatch">删除</v-btn> -->
        <v-btn color="deep-orange-darken-4" @click="toAutoMergeFlows()"
          >自助平账
        </v-btn>
        <v-btn color="deep-orange-darken-4" @click="toAutoDeduplicationFlows()"
          >自助去重
        </v-btn>
        <v-btn color="success" @click="openCreateDialog(formTitle[0])"
          >新增
        </v-btn>
        <v-btn
          v-show="selectedFlows.length > 0"
          color="error"
          @click="deleteItems()"
          >删除
        </v-btn>
        <v-btn
          v-show="selectedFlows.length > 0"
          color="primary"
          @click="toChangeTypeBatch()"
          >类型修改
        </v-btn>
      </div>
      <div class="flex space-x-2">
        <v-btn color="primary" @click="searchDrawer = true">筛选</v-btn>
        <v-btn color="success" @click="resetQuery()">重置</v-btn>
      </div>
    </div>
    <hr />
    <!-- 表格主体数据列表 -->
    <div class="flow-table">
      <v-data-table-server
        :height="getTableHeight()"
        :items-per-page="flowQuery.pageSize"
        :items="flowPageRef?.data"
        :itemsLength="flowPageRef?.total || 0"
        :headers="headers"
        :loading="loading"
        @update:options="changePage"
        v-model="selectedFlows"
        item-value="id"
        show-select
      >
        <template v-slot:item.day="{ value }">
          <p class="common-text-column" :title="value">
            {{ value }}
          </p>
        </template>
        <template v-slot:item.flowType="{ value }">
          <p class="common-text-column" :title="value">
            {{ value }}
          </p>
        </template>
        <template v-slot:item.type="{ value }">
          <p class="common-text-column" :title="value">
            {{ value }}
          </p>
        </template>
        <template v-slot:item.payType="{ value }">
          <p class="common-text-column" :title="value">
            {{ value }}
          </p>
        </template>
        <template v-slot:item.money="{ value }">
          <v-chip :color="value > 100 ? 'error' : 'warning'">{{
            Number(value).toFixed(2)
          }}</v-chip>
        </template>
        <template v-slot:item.name="{ value }">
          <p class="common-text-column" :title="value">
            {{ value }}
          </p>
        </template>
        <template v-slot:item.description="{ value }">
          <p class="common-text-column" :title="value">
            {{ value }}
          </p>
        </template>
        <template v-slot:item.invoice="{ value }">
          <div class="flex h-12" v-if="value">
            <div
              v-for="img in value.split(',')"
              class="relative flex cursor-pointer h-12 w-12"
              @click="openFullscreen(InvoiceUrls[img])"
              @mouseover="isHovering = img"
              @mouseleave="isHovering = ''"
            >
              <img
                v-show="img"
                class="object-contain"
                :src="InvoiceUrls[img]"
              />

              <div
                class="absolute top-0 w-full h-full flex bg-gray-800/60 justify-center items-center"
                v-if="isHovering == img"
              >
                <v-icon color="white" size="large"> mdi-fullscreen</v-icon>
              </div>
            </div>
          </div>
          <div v-else>未上传</div>
        </template>
        <!-- eslint-disable-next-line vue/valid-v-slot -->
        <template v-slot:item.actions="{ item }">
          <div class="flex space-x-2">
            <v-icon color="success" @click="openUpdateDialog('编辑流水', item)">
              mdi-pencil
            </v-icon>
            <v-icon color="primary" @click="editInvoice(item)">
              mdi-receipt-text-plus
            </v-icon>
            <v-icon color="error" @click="toDelete(item)"> mdi-delete </v-icon>
          </div>
        </template>
      </v-data-table-server>
    </div>

    <!-- 表格分页插件 -->
    <div style="margin-top: 0.5rem">
      <span class="pageSpan">
        <v-chip color="rgb(76, 152, 112)">
          总收入：<b>{{ Number(flowPageRef?.totalIn.toFixed(2)) }}</b>
        </v-chip>
        <v-chip color="rgb(217, 159, 8)">
          总支出：<b>{{ Number(flowPageRef?.totalOut.toFixed(2)) }}</b>
        </v-chip>
        <v-chip color="primary">
          净收入：<b>{{
            (
              Number(flowPageRef?.totalIn.toFixed(2)) -
              Number(flowPageRef?.totalOut.toFixed(2))
            ).toFixed(2)
          }}</b>
        </v-chip>
        <v-chip color="rgb(120, 120, 120)">
          不计收支：<b>{{ Number(flowPageRef?.notInOut.toFixed(2)) }}</b>
        </v-chip>
      </span>
    </div>
  </div>
  <v-navigation-drawer
    v-model="searchDrawer"
    width="300"
    temporary
    location="right"
  >
    <div class="m-4">
      <div class="queryParam">
        <v-date-input
          label="开始日期"
          cancel-text="取消"
          ok-text="确定"
          clearable
          variant="outlined"
          hide-details="auto"
          v-model="startDay"
          :hide-actions="true"
          @update:modelValue="changeStartDay"
          @click:clear="clearStartDay"
        ></v-date-input>
      </div>
      <div class="queryParam">
        <v-date-input
          label="结束日期"
          cancel-text="取消"
          ok-text="确定"
          variant="outlined"
          hide-details="auto"
          v-model="endDay"
          clearable
          :hide-actions="true"
          @update:modelValue="changeEndDay"
          @click:clear="clearEndDay"
        ></v-date-input>
      </div>
      <div class="queryParam">
        <v-combobox
          label="流水归属"
          hide-details="auto"
          variant="outlined"
          v-model="flowQuery.attribution as any"
          :items="attributionList"
          clearable
        ></v-combobox>
      </div>
      <div class="queryParam">
        <v-combobox
          label="名称"
          hide-details="auto"
          variant="outlined"
          v-model="flowQuery.name"
          :items="nameList"
          clearable
        >
          <template v-slot:item="{ item, props }">
            <div
              class="w-full p-2 cursor-pointer hover:bg-gray-200/10 duration-500 ease-in-out"
              @click="(props as any).onClick"
            >
              <p class="max-w-64 text-ellipsis line-clamp-1">
                {{ item.title }}
              </p>
            </div>
          </template>
        </v-combobox>
      </div>
      <div class="queryParam">
        <v-text-field
          label="备注"
          hide-details="auto"
          variant="outlined"
          v-model="flowQuery.description"
          clearable
        ></v-text-field>
      </div>
      <div class="queryParam">
        <v-autocomplete
          label="流水类型"
          hide-details="auto"
          variant="outlined"
          v-model="flowQuery.flowType"
          :items="FlowTypes"
          clearable
          @update:modelValue="changeTypes(flowQuery.flowType)"
        >
        </v-autocomplete>
      </div>
      <div class="queryParam">
        <v-autocomplete
          hide-details="auto"
          variant="outlined"
          :label="industryTypeLabel"
          clearable
          v-model="flowQuery.industryType as any"
          :items="[]"
          :hide-no-data="false"
          ref="filterIndustryTypeSelect"
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
                  @click="selectFilterIndustryType(item)"
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
        </v-autocomplete>
      </div>
      <div class="queryParam">
        <v-autocomplete
          hide-details="auto"
          variant="outlined"
          :label="payTypeLabel"
          clearable
          v-model="flowQuery.payType as any"
          :items="[]"
          :hide-no-data="false"
          ref="filterPayTypeSelect"
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
                  @click="selectFilterPayType(item)"
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
        </v-autocomplete>
      </div>
      <div class="queryParam" style="text-align: center">
        <!-- <v-btn
          style="margin-right: 0.5rem"
          color="success"
          @click="resetQuery()"
          >清除条件</v-btn
        > -->
        <v-btn class="w-full" color="primary" @click="doQuery()">查询</v-btn>
      </div>
    </div>
  </v-navigation-drawer>
  <v-navigation-drawer v-model="selectHeaderDialog" temporary location="left">
    <v-card-text class="flex flex-col space-y-4">
      <v-btn color="primary" @click="openCsvImport('alipay')">
        支付宝账单导入(CSV)
      </v-btn>
      <v-btn color="success" @click="openCsvImport('wxpay')">
        微信账单导入(CSV)
      </v-btn>
      <v-btn color="error" @click="openCsvImport('jdFinance')">
        京东金融账单导入(CSV)
      </v-btn>
      <v-btn color="purple-darken-2" @click="showFlowCustomImport()">
        自定义导入
      </v-btn>
      <v-btn color="orange-darken-2" @click="openJsonImport()">
        JSON导入
      </v-btn>
      <v-btn color="orange-darken-2" @click="exportFlows()">
        JSON导出
        <template v-slot:append>
          <v-tooltip text="不会导出小票图片">
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" icon="mdi-progress-question"> </v-icon>
            </template>
          </v-tooltip>
        </template>
      </v-btn>
      <div class="flex space-x-2">
        <v-btn color="green-lighten-2" @click="downloadCsvTemplate()">
          下载模板
        </v-btn>
        <v-btn
          color="blue-lighten-2"
          class="flex-1"
          @click="importCsvTemplate()"
        >
          模板导入
        </v-btn>
      </div>

      <v-file-input
        ref="csvFileInput"
        label="选择账单CSV文件"
        variant="outlined"
        accept=".csv"
        small-chips
        hide-details="auto"
        show-size
        v-model="csvFile"
        @update:model-value="readCsvInfo()"
        v-show="false"
      ></v-file-input>
    </v-card-text>
  </v-navigation-drawer>

  <!-- 图片蒙版 -->
  <div class="overlay" v-if="fullscrenn">
    <div class="flex justify-center items-center">
      <img
        :src="fullscreenImage"
        class="max-h-[95vh] max-w-[95vw] object-contains"
        alt="Fullscreen Image"
      />
    </div>
    <span
      class="close-button bg-gray-500 hover:bg-gray-400"
      @click="closeFullscreen"
      >&times;</span
    >
  </div>
  <!-- 流水编辑弹窗 -->
  <FlowEditDialog
    v-if="showFlowEditDialog"
    :title="dialogFormTitle"
    :flow="editItem"
    :success-callback="doQuery"
  />
  <!-- 文件导入窗口 -->
  <FlowJsonImportDialog
    v-if="showFlowJsonImportDialog"
    :success-callback="doQuery"
  />
  <FlowEditInvoiceDialog
    v-if="showFlowEditInvoiceDialog"
    :success-callback="doQuery"
    :item="editInvoiceItem"
  />
  <FlowAutoMergeDialog
    v-if="showAutoMergeFlowsDialog"
    :success-callback="doQuery"
    :item="editInvoiceItem"
  />
  <FlowAutoDeduplicationDialog
    v-if="showAutoDeduplicationFlowsDialog"
    :success-callback="doQuery"
  />

  <v-dialog v-model="showFlowExcelImportDialog" :fullscreen="true">
    <v-card>
      <v-card-title
        style="width: 100%; display: flex; justify-content: space-between"
      >
        <h3>CSV流水导入</h3>
        <v-btn
          variant="elevated"
          icon="mdi-close"
          color="error"
          @click="closeCsvTableDialog()"
        >
        </v-btn>
      </v-card-title>
      <v-card-text>
        <DatasCsvFlowTable
          :items="csvFlows"
          :table-head="csvHeaders"
          :table-body="csvDatas"
          :success-callback="importSuccess"
        />
      </v-card-text>
    </v-card>
  </v-dialog>

  <v-dialog v-model="showFlowCustomImportDialog" max-width="40rem">
    <FlowCustomImportDialog
      @success-callback="doQuery"
      @close="closeCustomImport"
    />
  </v-dialog>
  <v-dialog v-model="showChangeBatchTypeDialog" max-width="30rem">
    <v-card>
      <v-card-title
        style="width: 100%; display: flex; justify-content: space-between"
      >
        <h3>批量修改 {{ selectedFlows.length }} 条流水的类型</h3>
      </v-card-title>
      <v-card-text>
        <p class="text-sm pb-2 text-red-600">
          将你选中的流水全部改为下面选中的类型，不想修改字段可以不选
        </p>
        <div class="queryParam">
          <v-select
            label="流水类型"
            hide-details="auto"
            variant="outlined"
            :items="FlowTypes"
            :item-value="(i) => i.value"
            v-model="newTypes.flowType"
            clearable
            @update:modelValue="changeTypes(newTypes.flowType)"
          >
          </v-select>
        </div>
        <div class="queryParam">
          <v-combobox
            :label="industryTypeLabel"
            hide-details="auto"
            variant="outlined"
            allow-new
            clearable
            v-model="newTypes.industryType"
            :items="[]"
            :hide-no-data="false"
            ref="batchIndustryTypeSelect"
            @update:search="batchIndustryTypeSearchText = $event"
          >
            <template v-slot:no-data>
              <div class="p-4 max-w-md">
                <div class="text-sm text-gray-600 mb-2">点击选择类型：</div>
                <div class="flex flex-wrap gap-2">
                  <v-chip
                    v-for="item in filteredBatchIndustryTypeOptions"
                    :key="item"
                    variant="outlined"
                    color="green"
                    size="small"
                    class="cursor-pointer"
                    @click="selectBatchIndustryType(item)"
                  >
                    <v-icon size="x-small" class="mr-1">mdi-sack</v-icon>
                    {{ item }}
                  </v-chip>
                </div>
              </div>
            </template>
            <template v-slot:selection="{ item }">
              <div class="flex items-center">
                <v-icon color="green" size="small" class="mr-2">
                  mdi-sack
                </v-icon>
                <span>{{ item.title }}</span>
              </div>
            </template>
          </v-combobox>
        </div>
        <div class="queryParam">
          <v-combobox
            :label="payTypeLabel"
            hide-details="auto"
            variant="outlined"
            allow-new
            clearable
            v-model="newTypes.payType"
            :items="[]"
            :hide-no-data="false"
            ref="batchPayTypeSelect"
            @update:search="batchPayTypeSearchText = $event"
          >
            <template v-slot:no-data>
              <div class="p-4 max-w-md">
                <div class="text-sm text-gray-600 mb-2">点击选择支付方式：</div>
                <div class="flex flex-wrap gap-2">
                  <v-chip
                    v-for="item in filteredBatchPayTypeOptions"
                    :key="item"
                    variant="outlined"
                    color="blue"
                    size="small"
                    class="cursor-pointer"
                    @click="selectBatchPayType(item)"
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
        </div>
        <div class="queryParam">
          <v-combobox
            label="流水归属"
            hide-details="auto"
            variant="outlined"
            allow-new
            clearable
            v-model="newTypes.attribution"
            :items="attributionList"
          >
          </v-combobox>
        </div>
      </v-card-text>
      <v-card-actions>
        <div class="flex space-x-4 justify-center w-full">
          <v-btn
            color="warning"
            variant="outlined"
            @click="cancelChangeBatchType"
            >取消</v-btn
          >
          <v-btn color="success" variant="outlined" @click="changeItemsType"
            >确定</v-btn
          >
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "public",
  middleware: ["auth"],
});

// 第三方库引入
import { VDateInput } from "vuetify/labs/VDateInput";

import { exportJson } from "~/utils/fileUtils";
import type { Page } from "~/utils/model";

import type { FlowQuery } from "~/utils/model";

import {
  showFlowExcelImportDialog,
  showFlowEditDialog,
  showFlowJsonImportDialog,
  showFlowEditInvoiceDialog,
  showAutoDeduplicationFlowsDialog,
} from "~/utils/flag";
import FlowEditDialog from "~/components/dialog/FlowEditDialog.vue";
import FlowJsonImportDialog from "~/components/dialog/FlowJsonImportDialog.vue";
import FlowEditInvoiceDialog from "~/components/dialog/FlowEditInvoiceDialog.vue";
import FlowAutoMergeDialog from "~/components/dialog/FlowAutoMergeDialog.vue";
import FlowAutoDeduplicationDialog from "~/components/dialog/FlowAutoDeduplicationDialog.vue";
import FlowCustomImportDialog from "~/components/dialog/FlowCustomImport.vue";
import { dateFormater } from "@/utils/common";

import { getIndustryType, getPayType } from "~/utils/apis";
import { computed } from "vue";

const flowQuery = ref<FlowQuery>({
  pageNum: 1,
  pageSize: 20,
});

const bookName = localStorage.getItem("bookName");

const searchDrawer = ref(false);
const selectHeaderDialog = ref(false);

const industryTypeLabel = ref("支出类型/收入类型");
const payTypeLabel = ref("支付方式/收款方式");
const formTitle = ["新增流水", "修改流水"];
/*
 * 集中定义常量
 */
const typeDefault = ["请先选择流水类型"];
// 支出类型/收入类型
const industryTypeOptions = ref(typeDefault);
// 支付类型
const payTypeOptions = ref(typeDefault);

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

// 修改FlowType后联动
const changeTypes = (type?: string) => {
  if (type === "支出") {
    industryTypeLabel.value = "支出类型";
    payTypeLabel.value = "支付方式";
  } else if (type === "收入") {
    industryTypeLabel.value = "收入类型";
    payTypeLabel.value = "收款方式";
  } else {
    industryTypeLabel.value = "支出类型/收入类型";
    payTypeLabel.value = "支付方式/收款方式";
  }
  // if (!flowQuery.value.flowType) {
  //   industryTypeOptions.value = typeDefault;
  //   payTypeOptions.value = typeDefault;
  //   return;
  // }
  getIndustryType(type || "").then((data) => {
    // console.log(data);
    industryTypeOptions.value = data.map((d) => {
      return d.industryType;
    });
  });
  getPayType(type || "").then((data) => {
    payTypeOptions.value = data.map((d) => {
      return d.payType;
    });
  });
};

const startDay = ref();
const endDay = ref();
const changeStartDay = () => {
  if (startDay.value) {
    // console.log(startDay.value)
    flowQuery.value.startDay = dateFormater("YYYY-MM-dd", startDay.value);
  } else {
    flowQuery.value.startDay = "";
  }
};
const clearStartDay = () => {
  startDay.value = null;
  flowQuery.value.startDay = "";
};
const changeEndDay = () => {
  if (endDay.value) {
    // console.log(endDay.value)
    flowQuery.value.endDay = dateFormater("YYYY-MM-dd", endDay.value);
  } else {
    flowQuery.value.endDay = "";
  }
};
const clearEndDay = () => {
  endDay.value = null;
  flowQuery.value.endDay = "";
};
const resetQuery = () => {
  flowQuery.value = {
    pageNum: 1,
    pageSize: 20,
  };
  searchDrawer.value = false;
  doQuery();
};

const headers = ref<any[]>([
  { title: "日期", key: "day", sortable: false },
  { title: "流水类型", key: "flowType", sortable: false },
  { title: "支出类型/收入类型", key: "industryType", sortable: false },
  { title: "支付方式/收款方式", key: "payType", sortable: false },
  { title: "金额", key: "money", align: "end" },
  { title: "流水归属", key: "attribution", sortable: false },
  { title: "名称", key: "name", sortable: false },
  { title: "小票", key: "invoice", sortable: false },
  { title: "备注", key: "description", sortable: false },
  { title: "操作", key: "actions", sortable: false },
]);

/**
 * 组件属性绑定
 */
// 加载蒙版显示控制器
const loading = ref(true);
// 表单弹窗标题
const dialogFormTitle = ref(formTitle[0]);
// 分页数据绑定
const flowPageRef = ref<Page<Flow>>();

const selectedFlows = ref<any[]>([]);

const changePage = (param: {
  page: number;
  itemsPerPage: number;
  sortBy: { key: string; order: string }[];
}) => {
  // console.log(param)
  flowQuery.value.pageNum = param.page;
  flowQuery.value.pageSize = param.itemsPerPage;
  if (param.sortBy[0] && param.sortBy[0].key === "money") {
    flowQuery.value.moneySort = param.sortBy[0].order;
  } else {
    flowQuery.value.moneySort = "";
  }
  doQuery();
};

const editInvoiceItem = ref<Flow | any>({});
const editInvoice = (item: Flow) => {
  editInvoiceItem.value = item;
  showFlowEditInvoiceDialog.value = true;
};

const isHovering = ref("");
// 获取小票图片url的一些逻辑
const InvoiceUrls = ref<Record<string, string>>({});
const getInvoiceUrl = async (invoice: string) => {
  const defalutImage = "/logo.png";
  if (!invoice) {
    InvoiceUrls.value[invoice] = defalutImage;
    return;
  }
  try {
    for (let img of invoice.split(",")) {
      const res = await doApi.download("api/entry/flow/invoice/show", {
        invoice: img,
      });
      // console.log(res);
      InvoiceUrls.value[img] = res ? URL.createObjectURL(res) : res;
    }
  } catch (e) {
    InvoiceUrls.value[invoice] = defalutImage;
  }
};
// 全屏展示小票
const fullscrenn = ref(false);
const fullscreenImage = ref("");
const openFullscreen = (image: string) => {
  fullscrenn.value = true;
  fullscreenImage.value = image.replace("/thumbs", "");
  window.addEventListener("keydown", handleKeydown);
};
const closeFullscreen = () => {
  fullscrenn.value = false;
  window.removeEventListener("keydown", handleKeydown);
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && fullscrenn.value) {
    fullscrenn.value = false;
  }
};

// 执行分页数据查询
const doQuery = () => {
  // 清空选中状态
  selectedFlows.value = [];
  loading.value = true;
  searchDrawer.value = false;
  doApi
    .post<Page<Flow>>("api/entry/flow/page", {
      ...flowQuery.value,
      bookId: localStorage.getItem("bookId"),
    })
    .then((res) => {
      if (res) {
        // console.log(res)
        // Alert.success('查询成功')
        flowPageRef.value = res;
        for (let flow of flowPageRef.value.data) {
          getInvoiceUrl(flow.invoice || "");
        }
      }
    })
    .finally(() => {
      loading.value = false;
    });
};

const toAutoMergeFlows = () => {
  showAutoMergeFlowsDialog.value = true;
};

const toAutoDeduplicationFlows = () => {
  showAutoDeduplicationFlowsDialog.value = true;
};

// 确认删除的一些逻辑
const toDelete = (item: Flow) => {
  if (!item.id) {
    Alert.error("请选择要删除的数据");
    return;
  }
  Confirm.open({
    title: "删除确认",
    content: `确定删除流水 【${item.name}:${item.money}】吗?`,
    confirm: () => {
      doApi
        .post("api/entry/flow/del", {
          id: item.id,
          bookId: localStorage.getItem("bookId"),
        })
        .then((res) => {
          Alert.success("删除成功");
          doQuery();
        })
        .catch((res) => {
          console.log(res);
          Alert.error("删除失败");
        });
    },
  });
};

// 批量删除
const deleteItems = () => {
  if (selectedFlows.value.length <= 0) {
    Alert.error("请至少选择一条要删除的流水");
    return;
  }
  console.log(selectedFlows.value);
  Confirm.open({
    title: "删除确认",
    content: `确定删除流水 【${selectedFlows.value.length} 条】吗?`,
    confirm: () => {
      doApi
        .post("api/entry/flow/dels", {
          ids: selectedFlows.value,
          bookId: localStorage.getItem("bookId"),
        })
        .then((res) => {
          Alert.success("删除成功");
          selectedFlows.value = [];
          doQuery();
        })
        .catch((res) => {
          console.log(res);
          Alert.error("删除失败");
        });
    },
  });
};

const newTypes = ref<any>({
  flowType: undefined,
  industryType: undefined,
  payType: undefined,
});
const showChangeBatchTypeDialog = ref(false);
const toChangeTypeBatch = () => {
  if (selectedFlows.value.length <= 0) {
    Alert.error("请至少选择一条要修改的流水");
    return;
  }
  showChangeBatchTypeDialog.value = true;
};
const cancelChangeBatchType = () => {
  showChangeBatchTypeDialog.value = false;
  newTypes.value = {
    flowType: undefined,
    industryType: undefined,
    payType: undefined,
  };
};
// 批量修改类型
const changeItemsType = () => {
  console.log(newTypes.value);
  let changeInfo = "";
  if (newTypes.value.flowType) {
    changeInfo += `  流水类型改为: "${newTypes.value.flowType}"\n`;
  }
  if (newTypes.value.industryType) {
    changeInfo += `  支出类型/收入类型改为: "${newTypes.value.industryType}"\n`;
  }
  if (newTypes.value.payType) {
    changeInfo += `  支付方式/收款方式改为: "${newTypes.value.payType}"`;
  }
  if (newTypes.value.attribution) {
    changeInfo += `  流水归属改为: "${newTypes.value.attribution}"`;
  }
  if (!changeInfo) {
    Alert.error("未发现任何变更信息");
    return;
  }
  Confirm.open({
    title: "修改确认",
    content: `确定对【${selectedFlows.value.length}】条流水进行如下修改吗? \n${changeInfo}`,
    confirm: () => {
      doApi
        .post("api/entry/flow/updates", {
          ids: selectedFlows.value,
          bookId: localStorage.getItem("bookId"),
          ...newTypes.value,
        })
        .then((res) => {
          Alert.success("修改成功");
          showChangeBatchTypeDialog.value = false;
          doQuery();
        })
        .catch((res) => {
          console.log(res);
          Alert.error("修改失败");
        });
    },
  });
};

// 打开新增弹窗
const openCreateDialog = (title: string) => {
  industryTypeLabel.value = "支出类型/收入类型";
  payTypeLabel.value = "支付方式/收款方式";
  dialogFormTitle.value = title;
  showFlowEditDialog.value = true;
  editItem.value = {};
};

const editItem = ref<Flow | any>({});
// 打开修改弹窗
const openUpdateDialog = (title: string, updateFlow: Flow) => {
  dialogFormTitle.value = title;
  showFlowEditDialog.value = true;
  editItem.value = updateFlow;
};

// 导出方法(前台导出，后台负责要导出的查询数据)
const exportFlows = () => {
  doApi
    .post("api/entry/flow/list", {
      ...flowQuery.value,
      bookId: localStorage.getItem("bookId"),
    })
    .then((data) => {
      const fileName = bookName + "-" + new Date().getTime() + ".json";
      exportJson(fileName, JSON.stringify(data));
    })
    .catch(() => {
      Alert.error("数据获取出错，无法导出！");
    });
};

const downloadCsvTemplate = () => {
  // public/csvtemplate.csv
  const fileName = "Cashbook模板.csv";
  const url = "/csvtemplate.csv";
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
};

const importCsvTemplate = () => {
  if (!csvFileInput.value) {
    return;
  }
  fileType.value = "template";
  titleRowIndex.value = 0;
  csvFileInput.value.click();
};

// 动态设置列表高度
const getTableHeight = () => {
  return window.innerWidth < 1080
    ? window.innerHeight - 64 * 5
    : window.innerHeight - 64 * 4;
};

changeTypes();

const openJsonImport = () => {
  showFlowJsonImportDialog.value = true;
};

import * as XLSX from "xlsx";

import {
  alipayConvert,
  jdFinanceConvert,
  wxpayConvert,
} from "@/utils/flowConvert";

// 上传文件类型标识：none-未知文件；alipay-支付宝；wxpay-微信；jdFinance-京东
const fileType = ref("none");
// 触发文件上传的输入框
const csvFileInput = ref();
const openCsvImport = (type: string) => {
  if (!csvFileInput.value) {
    return;
  }
  fileType.value = type;
  if (fileType.value === "alipay") {
    // 支付宝表头行是第25行，索引是24
    titleRowIndex.value = 24;
  } else if (fileType.value === "wxpay") {
    // 微信表头行是第17行，索引是16
    titleRowIndex.value = 16;
  } else if (fileType.value === "jdFinance") {
    // 京东金融表头行是第22行，索引是21
    titleRowIndex.value = 21;
  }
  csvFileInput.value.click();
};

const csvFile = ref();
const csvFlows = ref<Flow[] | any>([]);
const csvHeaders = ref<Record<string, number>>({});
const csvDatas = ref<Record<number, any>[]>([]);
// 表头行索引
const titleRowIndex = ref(0);

const readCsvInfo = () => {
  // console.log(csvFile.value)
  const file = csvFile.value;
  if (!file) {
    csvFlows.value = [];
    return;
  }
  // 创建FileReader对象
  const reader = new FileReader();

  // 设置文件读取完成后的回调函数
  reader.onload = (event) => {
    try {
      // 文件数据ArrayBuffer
      const buffer = event.target?.result;
      // 待保存excel实体
      let workbook: XLSX.WorkBook;

      /**************************************/
      // 不同编码格式读取
      /**************************************/
      if (fileType.value === "alipay") {
        // 阿里csv账单为GB2312编码，需要特殊处理，gan
        // @ts-ignore
        const context = new TextDecoder("gb2312").decode(buffer);
        workbook = XLSX.read(context, { type: "string", codepage: 936 });
      } else {
        workbook = XLSX.read(buffer, { raw: true });
      }
      // 至此，初步说明文件没有什么问题，清理一下历史数据，准备解析组装新数据
      removeFile();

      /**************************************/
      // 将 xlsx 数据结构转换为 node-xlsx 数据结构，便于页面回显
      // sheets是sheet的数组，每个sheet有两个属性: name - sheet名称 data - sheet数据
      /**************************************/
      const sheets = workbook.SheetNames.map((sheetName) => {
        const xlsxSheet = workbook.Sheets[sheetName];
        // console.log(xlsxSheet)
        const sheetData = XLSX.utils.sheet_to_json<any[]>(xlsxSheet, {
          header: 1, // 表头行数
          defval: "",
          dateNF: "yyyy-mm-dd", // 日期格式
        });
        return {
          sheetName,
          sheetData,
        };
      });

      // 数据集合--csv默认只有一个sheet，所以只需要取第一个sheet
      const sheetData: any[] = sheets[0].sheetData;
      /**************************************/
      // 表头数据
      /**************************************/
      // 表头索引集合，key-表头值，value-表头索引
      const headerData = sheetData[titleRowIndex.value];
      for (let i = 0; i < headerData.length; i++) {
        if (!headerData[i] || headerData[i].trim() === "") {
          // 表头为空，跳过该列
          continue;
        }
        csvHeaders.value[headerData[i]] = i;
      }
      // 删除表头及以上行数据，只保留流水数据
      sheetData.splice(0, titleRowIndex.value + 1);

      /**************************************/
      // 数据主体（table-body）回显
      /**************************************/
      // 时间列的索引
      const timeIndex = csvHeaders.value["交易时间"];
      sheetData.forEach((row) => {
        // console.log(row);
        // 部分数据字段格式化，并回显
        for (let i = 0; i < row.length; i++) {
          let cellValue = row[i];
          // 日期字段特殊处理，将日期数字转换为 JavaScript 日期对象
          // 目前京东/支付宝/微信可以统一处理
          if (i === timeIndex) {
            // console.log(cellValue);
            if (typeof cellValue === "number" && cellValue > 0) {
              // Excel 中日期从1899年12月30日开始
              const excelStartDate = new Date(1899, 11, 30);
              const resultDate = new Date(excelStartDate);
              resultDate.setDate(resultDate.getDate() + cellValue);
              // 添加时区偏移（假设是+8小时）
              resultDate.setHours(resultDate.getHours() + 8);
              // 简单的日期转字符串
              cellValue = resultDate.toISOString().split("T")[0];
              // 将格式化后的字符串重新赋值会sheetData，后续存储需要使用格式化后的的数据
              row[i] = cellValue;
            } else {
              // 每年1月1日解析后不是数字，因此不需要特殊处理，直接当作日期处理即可
              // 已知只有支付宝1月1日会报错。其他的还不知道
              const resultDate = new Date(cellValue);
              // 添加时区偏移（假设是+8小时）
              resultDate.setHours(resultDate.getHours() + 8);
              cellValue = resultDate.toISOString().split("T")[0];
              // 将格式化后的字符串重新赋值会sheetData，后续存储需要使用格式化后的的数据
              row[i] = cellValue;
            }
          }
        }
        // data[i] = row;
        // 一行数据作为一个记录，csvDatas中每一个记录代表一个流水
        csvDatas.value.push(row);

        /**************************************/
        // 解析数据到实体集合
        /**************************************/
        let flow;
        if (fileType.value === "alipay") {
          flow = alipayConvert(row, csvHeaders.value);
        } else if (fileType.value === "wxpay") {
          flow = wxpayConvert(row, csvHeaders.value);
        } else if (fileType.value === "jdFinance") {
          flow = jdFinanceConvert(row, csvHeaders.value);
        } else {
          // 其他数据，暂不处理
          flow = templateConvert(row, csvHeaders.value);
        }
        csvFlows.value.push(flow);
      });
      Alert.warning("数据解析完成，请预览并点击【确定导入】保存数据");
      showFlowExcelImportDialog.value = true;
    } catch (error) {
      console.error(error);
      Alert.error("数据解析出错了，请确认文件是否存在问题");
    }
  };

  // 读取文件的内容为文本
  reader.readAsArrayBuffer(file);
};

const importSuccess = () => {
  closeCsvTableDialog();
  doQuery();
};
const removeFile = () => {
  csvFlows.value = [];
  csvHeaders.value = {};
  csvDatas.value = [];
  csvFile.value = undefined; // 清楚选中的文件
  return true;
};

const closeCsvTableDialog = () => {
  showFlowExcelImportDialog.value = false;
  removeFile();
};

const showFlowCustomImportDialog = ref(false);

const showFlowCustomImport = () => {
  showFlowCustomImportDialog.value = true;
};

const closeCustomImport = () => {
  showFlowCustomImportDialog.value = false;
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

const filterIndustryTypeSelect = ref();
const filterPayTypeSelect = ref();

const selectFilterIndustryType = (item: string) => {
  (flowQuery.value.industryType as any) = item;
  if (filterIndustryTypeSelect.value) {
    filterIndustryTypeSelect.value.blur();
  }
};

const selectFilterPayType = (item: string) => {
  (flowQuery.value.payType as any) = item;
  if (filterPayTypeSelect.value) {
    filterPayTypeSelect.value.blur();
  }
};

const batchIndustryTypeSelect = ref();
const batchPayTypeSelect = ref();

const selectBatchIndustryType = (item: string) => {
  newTypes.value.industryType = item;
  if (batchIndustryTypeSelect.value) {
    batchIndustryTypeSelect.value.blur();
  }
};

const selectBatchPayType = (item: string) => {
  newTypes.value.payType = item;
  if (batchPayTypeSelect.value) {
    batchPayTypeSelect.value.blur();
  }
};

// 添加筛选相关的响应式变量
const industryTypeSearchText = ref("");
const payTypeSearchText = ref("");
const batchIndustryTypeSearchText = ref("");
const batchPayTypeSearchText = ref("");

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

const filteredBatchIndustryTypeOptions = computed(() => {
  if (!batchIndustryTypeSearchText.value) {
    return industryTypeOptions.value;
  }
  return industryTypeOptions.value.filter(item =>
    item.toLowerCase().includes(batchIndustryTypeSearchText.value.toLowerCase())
  );
});

const filteredBatchPayTypeOptions = computed(() => {
  if (!batchPayTypeSearchText.value) {
    return payTypeOptions.value;
  }
  return payTypeOptions.value.filter(item =>
    item.toLowerCase().includes(batchPayTypeSearchText.value.toLowerCase())
  );
});
</script>

<style scoped>
.flow-container {
  width: 100%;
  height: 100%;
  padding: 0.5rem;
}

.common-text-column {
  min-width: 5rem;
  max-width: 10rem;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

/* 在这里添加样式来隐藏 overlay 和 fullscreen-image */
.overlay {
  z-index: 11111;
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(55, 55, 55, 0.8);
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}

.close-button {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center;
  /* padding: 0 0.5rem; */
  color: rgb(255, 131, 131);
  border-radius: 50%;
  font-size: 30px;
  position: absolute;
  top: 10px;
  right: 20px;
  cursor: pointer;
}
</style>
