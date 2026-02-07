<template>
  <div class="chart-common-container">
    <!-- 时间筛选侧边栏 -->
    <div
      v-if="searchDrawer"
      class="fixed inset-0 z-50 flex justify-end"
      @click="searchDrawer = false"
    >
      <div
        class="w-80 h-full bg-surface shadow-xl border-l border-border p-2 md:p-4 overflow-y-auto"
        @click.stop
      >
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-foreground">
            时间筛选
          </h3>
          <button
            @click="searchDrawer = false"
            class="p-2 text-muted hover:text-foreground transition-colors"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="space-y-4">
          <UiDatePicker
            v-model="startDay"
            label="开始日期"
            placeholder="请选择开始日期"
            @change="changeStartDay"
          />

          <UiDatePicker
            v-model="endDay"
            label="结束日期"
            placeholder="请选择结束日期"
            @change="changeEndDay"
          />
        </div>
      </div>
    </div>

    <div
      class="flex flex-col md:flex-row md:justify-between items-center w-full border-b border-border md:h-16 mb-4"
    >
      <div>
        <h4
          class="hidden md:flex text-lg font-semibold text-foreground my-2"
        >
          {{ title }}【{{ chartParam.flowType }}】
        </h4>
      </div>

      <div class="flex space-x-2 pb-2 items-center">
        <button
          @click="searchDrawer = true"
          class="px-2 py-1 md:px-4 md:py-2 bg-primary-600 text-white rounded-md shadow-sm hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
        >
          时间筛选
        </button>
        <div class="min-w-32">
          <select
            v-model="chartParam.flowType"
            class="w-full px-2 py-1 md:px-3 md:py-2 border border-border rounded-md shadow-md bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option
              v-for="type in FlowTypes"
              :key="type.value"
              :value="type.value"
            >
              {{ type.title }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div
      v-show="noData"
      :style="`width: ${width}; height: ${height};`"
      class="flex items-center justify-center"
    >
      <h3 class="text-lg text-red-500 font-medium">暂无数据</h3>
    </div>
    <div
      v-show="!noData"
      :id="chartId"
      :style="`width: ${width}; height: ${height};`"
    ></div>
  </div>

  <!-- 流水表格对话框 -->
  <div
    v-if="showFlowTable"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    @click="showFlowTable = false"
  >
    <div
      class="w-full max-w-6xl max-h-[90vh] bg-surface rounded-lg shadow-xl overflow-hidden"
      @click.stop
    >
      <div
        class="flex justify-between items-center p-4 border-b border-border"
      >
        <h3 class="text-lg font-semibold text-foreground">
          流水详情
        </h3>
        <button
          @click="showFlowTable = false"
          class="px-4 py-2 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
        >
          关闭
        </button>
      </div>
      <div class="p-2 md:p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
        <DatasFlowTable :query="query" v-if="showFlowTable" :actions="false" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as echarts from "echarts";
import { onMounted, ref, watch } from "vue";
import { dateFormater, miniFullscreen } from "@/utils/common";
import { FlowTypes } from "@/utils/constant";
import { doApi } from "@/utils/api";
import type { CommonChartData, CommonChartQuery } from "~/utils/model";
import DatasFlowTable from "@/components/datas/FlowTable.vue";

const { isDark } = useAppTheme();

const searchDrawer = ref(false);
// 使用 props 来接收外部传入的参数
const { title, width, height } = defineProps(["title", "width", "height"]);

// 生成唯一ID避免冲突
const chartId = ref(
  `attributionPieDiv-${Math.random().toString(36).substr(2, 9)}`
);

const chartParam = ref<CommonChartQuery>({ flowType: "支出" });

const dataList: any[] = [];
const noData = ref(false);

const startDay = ref();
const endDay = ref();
const changeStartDay = (value: string | null) => {
  chartParam.value.startDay = value || "";
};

const changeEndDay = (value: string | null) => {
  chartParam.value.endDay = value || "";
};

const optionRef = ref({
  tooltip: {
    trigger: "item",
  },
  legend: {
    tooltip: {
      // trigger: "item",
      formatter: function (legend: any) {
        // {componentType: 'legend', name: '其他网购', $vars: Array(1), legendIndex: 0}
        // 找到对应的类型，显示数值
        for (let d of dataList) {
          if (legend.name == d.name) {
            // console.log(d);
            return `${legend.name}: ${d.value}`;
          }
        }
        // console.log(legend);
        return `未找到${legend.name}`;
        // return echarts.format.truncateText(
        //   name,
        //   40,
        //   "14px Microsoft Yahei",
        //   "…"
        // );
      },
      show: true,
    },
    textStyle: {
      color: "#374151",
    },
  },
  toolbox: {
    feature: {
      // 下载按钮
      // saveAsImage: {}
    },
  },
  series: [
    {
      name: "流水责任人",
      type: "pie",
      radius: ["50%", "80%"],
      // center: ['10%', '30%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: "#d1d5db",
        borderWidth: 1,
      },
      // grid: {
      //   left: '30',
      //   top: '20',
      //   right: '30',
      //   buttom: '20'
      // },
      label: {
        show: true,
        position: "center",
        formatter(param: any) {
          // correct the percentage
          return param.name + " (" + param.percent + "%)";
        },
      },
      emphasis: {
        label: {
          show: true,
          fontSize: "40",
          fontWeight: "bold",
        },
      },
      labelLine: {
        show: false,
      },
      data: dataList,
    },
  ],
});

let attributionDiv: any;
let attributionChart: echarts.ECharts;

const doQuery = (query: CommonChartQuery) => {
  doApi
    .post<CommonChartData[]>("api/entry/analytics/attribution", {
      bookId: localStorage.getItem("bookId"),
      ...query,
    })
    .then((res) => {
      if (res) {
        if (res.length === 0) {
          // console.log("PayTypeBar未查询到数据！");
          noData.value = true;
          return;
        } else {
          noData.value = false;
        }
        dataList.length = 0;
        if (query.flowType == "支出") {
          // 先排序
          res.sort((a, b) => Number(b.outSum) - Number(a.outSum));
          res.forEach((data) => {
            dataList.push({
              value: Number(data.outSum).toFixed(2),
              name: data.type,
            });
          });
        } else if (query.flowType == "收入") {
          // 先排序
          res.sort((a, b) => Number(b.inSum) - Number(a.inSum));
          res.forEach((data) => {
            dataList.push({
              value: Number(data.inSum).toFixed(2),
              name: data.type,
            });
          });
        } else {
          // 先排序
          res.sort((a, b) => Number(b.zeroSum) - Number(a.zeroSum));
          res.forEach((data) => {
            dataList.push({
              value: Number(data.zeroSum).toFixed(2),
              name: data.type,
            });
          });
        }

        optionRef.value.series[0].data = dataList;
        optionRef.value.legend.textStyle.color = isDark.value
          ? "#e5e7eb"
          : "#374151";
        optionRef.value.series[0].itemStyle.borderColor = isDark.value
          ? "#4b5563"
          : "#d1d5db";

        attributionChart.setOption(optionRef.value);
      }
    });
};

watch(chartParam.value, () => {
  doQuery(chartParam.value);
});

const query = ref();
const showFlowTable = ref(false);

onMounted(() => {
  if (miniFullscreen()) {
    // @ts-ignore
    optionRef.value.legend.top = "bottom";
    // @ts-ignore
    optionRef.value.legend.left = "center";
    // @ts-ignore
    optionRef.value.legend.orient = "horizontal";
    // @ts-ignore
    optionRef.value.series[0].center = ["50%", "40%"];
  } else {
    // @ts-ignore
    optionRef.value.legend.left = "0";
    // @ts-ignore
    optionRef.value.legend.orient = "vertical";
  }

  attributionDiv = document.getElementById(chartId.value);
  const oldInstance = echarts.getInstanceByDom(attributionDiv);
  if (oldInstance) {
    oldInstance.dispose();
  }
  attributionChart = echarts.init(attributionDiv);
  attributionChart.on("click", function (param) {
    query.value = { ...chartParam.value, attribution: param.name };
    showFlowTable.value = true;
  });
  doQuery(chartParam.value);
});
</script>

<style scoped></style>
