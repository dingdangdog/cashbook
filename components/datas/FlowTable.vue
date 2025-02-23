<template>
  <v-card>
    <v-card-title>
      <div>
        <span class="tw-mx-1" v-show="flowQuery.startDay">{{
          flowQuery.startDay
        }}</span>
        <span class="tw-mx-1" v-show="flowQuery.endDay">{{
          flowQuery.endDay
        }}</span>
        <span class="tw-mx-1" v-show="flowQuery.flowType">{{
          flowQuery.flowType
        }}</span>
        <span class="tw-mx-1" v-show="flowQuery.industryType">{{
          flowQuery.industryType
        }}</span>
        <span class="tw-mx-1" v-show="flowQuery.payType">{{
          flowQuery.payType
        }}</span>
        <span class="tw-mx-1" v-show="flowQuery.attribution">{{
          flowQuery.attribution
        }}</span>
      </div>
    </v-card-title>
    <v-card-text>
      <!-- 流水表格，用于其他页面引用，不是流水管理页面的表格 -->
      <div class="flow-container">
        <!-- 表格主体数据列表 -->
        <div>
          <v-data-table-server
            :height="getTableHeight()"
            noDataText="暂无数据"
            :items-per-page="flowQuery.pageSize"
            :items="flowPageRef.data"
            :itemsLength="flowPageRef.total"
            :headers="headers"
            :loading="loading"
            @update:options="changePage"
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
                value
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
          </v-data-table-server>
        </div>
        <hr />
        <!-- 表格分页插件 -->
        <div style="margin-top: 0.5rem">
          <span class="pageSpan">
            <v-chip color="rgb(76, 152, 112)">
              总收入：<b>{{ Number(flowPageRef.totalIn.toFixed(2)) }}</b>
            </v-chip>
            <v-chip color="rgb(217, 159, 8)">
              总支出：<b>{{ Number(flowPageRef.totalOut.toFixed(2)) }}</b>
            </v-chip>
            <v-chip color="rgb(120, 120, 120)">
              不计收支：<b>{{ Number(flowPageRef.notInOut.toFixed(2)) }}</b>
            </v-chip>
          </span>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
// 第三方库引入
import { ref, watch } from "vue";

const { query } = defineProps(["query"]);

const flowQuery = ref<FlowQuery>({ pageNum: 1, pageSize: 20, ...query });

const typeLabel = ref("支出/收入类型");
const payTypeLabel = ref("支付/收款方式");

const typeDefault = ["请先选择流水类型"];
// 消费类型/收入类型
const expenseTypeOptions = ref(typeDefault);
// 支付类型
const paymentTypeOptions = ref(typeDefault);

// 修改FlowType后联动
const changeTypes = () => {
  if (flowQuery.value.flowType === "支出") {
    typeLabel.value = "支出类型";
    payTypeLabel.value = "支付方式";
  } else if (flowQuery.value.flowType === "收入") {
    typeLabel.value = "收入类型";
    payTypeLabel.value = "收款方式";
  } else {
    typeLabel.value = "支出/收入类型";
    payTypeLabel.value = "支付/收款方式";
  }
  if (!flowQuery.value.flowType) {
    expenseTypeOptions.value = typeDefault;
    paymentTypeOptions.value = typeDefault;
    return;
  }
  getIndustryType(flowQuery.value.flowType).then((data) => {
    // @ts-ignore
    expenseTypeOptions.value = data.map((item) => {
      return item.value;
    });
  });
  getPayType(flowQuery.value.flowType).then((data) => {
    // @ts-ignore
    paymentTypeOptions.value = data.map((item) => {
      return { title: item.value };
    });
  });
};

const headers = ref([
  { title: "日期", key: "day", sortable: false },
  { title: "流水类型", key: "flowType", sortable: false },
  { title: "消费类型", key: "industryType", sortable: false },
  { title: "支付方式", key: "payType", sortable: false },
  { title: "金额", key: "money" },
  { title: "名称", key: "name", sortable: false },
  { title: "备注", key: "description", sortable: false },
]);

/**
 * 组件属性绑定
 */
// 加载蒙版显示控制器
const loading = ref(true);
// 分页数据绑定
const flowPageRef = ref<Page<Flow>>({
  pageNum: 1,
  pageSize: 0,
  pages: 1,
  total: 0,
  totalOut: 0,
  totalIn: 0,
  notInOut: 0,
  data: [],
});

const changePage = (param: {
  page: number;
  itemsPerPage: number;
  sortBy: { key: string; order: string }[];
}) => {
  // console.log(param);
  flowQuery.value.pageNum = param.page;
  flowQuery.value.pageSize = param.itemsPerPage;
  if (param.sortBy[0] && param.sortBy[0].key === "money") {
    flowQuery.value.moneySort = param.sortBy[0].order;
  } else {
    flowQuery.value.moneySort = "";
  }
  doQuery();
};

// 执行分页数据查询
const doQuery = () => {
  loading.value = true;
  doApi
    .post<Page<Flow>>("api/entry/flow/page", {
      ...flowQuery.value,
      bookId: localStorage.getItem("bookId"),
    })
    .then((res) => {
      flowPageRef.value = res;
    })
    .finally(() => {
      loading.value = false;
    });
};

// doQuery();
changeTypes();
const searching = ref(false);

const getTableHeight = () => {
  return window.innerWidth < 1080
    ? window.innerHeight - 64 * 5.5
    : window.innerHeight - 64 * 6;
};

watch(flowQuery.value, () => {
  if (searching.value) {
    return;
  }
  searching.value = true;
  setTimeout(() => {
    searching.value = false;
    doQuery();
  }, 1000);
});
</script>

<style scoped>
.flow-container {
  padding: 0.5rem 1rem;
}

.common-text-column {
  min-width: 5rem;
  max-width: 10rem;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
</style>
