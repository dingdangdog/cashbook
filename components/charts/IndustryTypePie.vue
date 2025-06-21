<template>
  <div class="chart-common-container">
    <!-- 时间筛选侧边栏 -->
    <div
      v-if="searchDrawer"
      class="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-justify-end"
      @click="searchDrawer = false"
    >
      <div
        class="tw-w-80 tw-h-full tw-bg-white dark:tw-bg-gray-800 tw-shadow-xl tw-border-l tw-border-gray-200 dark:tw-border-gray-700 tw-p-4 tw-overflow-y-auto"
        @click.stop
      >
        <div class="tw-flex tw-justify-between tw-items-center tw-mb-4">
          <h3
            class="tw-text-lg tw-font-semibold tw-text-gray-900 dark:tw-text-white"
          >
            时间筛选
          </h3>
          <button
            @click="searchDrawer = false"
            class="tw-p-2 tw-text-gray-500 hover:tw-text-gray-700 dark:tw-text-gray-400 dark:hover:tw-text-gray-200 tw-transition-colors"
          >
            <svg
              class="tw-w-5 tw-h-5"
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

        <div class="tw-space-y-4">
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
      class="tw-flex tw-flex-col md:tw-flex-row md:tw-justify-between tw-items-center tw-w-full tw-border-b tw-border-gray-200 dark:tw-border-gray-700 md:tw-h-16 tw-mb-4"
    >
      <div>
        <h4
          class="tw-hidden md:tw-flex tw-text-lg tw-font-semibold tw-text-gray-900 dark:tw-text-white tw-my-2"
        >
          {{ title }}【{{ chartParam.flowType }}】
        </h4>
      </div>

      <div class="tw-flex tw-space-x-2 tw-items-center">
        <button
          @click="searchDrawer = true"
          class="tw-px-4 tw-py-2 tw-bg-blue-600 tw-text-white tw-rounded-md tw-shadow-sm hover:tw-bg-blue-700 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-ring-offset-2 tw-transition-colors"
        >
          时间筛选
        </button>
        <div class="tw-min-w-32">
          <select
            v-model="chartParam.flowType"
            class="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 dark:tw-border-gray-600 tw-rounded-md tw-shadow-md tw-bg-white dark:tw-bg-gray-700 tw-text-gray-900 dark:tw-text-white focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-blue-500"
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
      class="tw-flex tw-items-center tw-justify-center"
    >
      <h3 class="tw-text-lg tw-text-red-500 tw-font-medium">暂无数据</h3>
    </div>
    <div
      v-show="!noData"
      id="typePieDiv"
      :style="`width: ${width}; height: ${height};`"
    ></div>
  </div>

  <!-- 流水表格对话框 -->
  <div
    v-if="showFlowTable"
    class="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-bg-black tw-bg-opacity-50"
    @click="showFlowTable = false"
  >
    <div
      class="tw-w-full tw-max-w-6xl tw-max-h-[90vh] tw-bg-white dark:tw-bg-gray-800 tw-rounded-lg tw-shadow-xl tw-overflow-hidden"
      @click.stop
    >
      <div
        class="tw-flex tw-justify-between tw-items-center tw-p-4 tw-border-b tw-border-gray-200 dark:tw-border-gray-700"
      >
        <h3
          class="tw-text-lg tw-font-semibold tw-text-gray-900 dark:tw-text-white"
        >
          流水详情
        </h3>
        <button
          @click="showFlowTable = false"
          class="tw-px-4 tw-py-2 tw-bg-red-600 tw-text-white tw-rounded-md tw-shadow-sm hover:tw-bg-red-700 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-red-500 focus:tw-ring-offset-2 tw-transition-colors"
        >
          关闭
        </button>
      </div>
      <div class="tw-p-4 tw-overflow-y-auto tw-max-h-[calc(90vh-80px)]">
        <DatasFlowTable :query="query" v-if="showFlowTable" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as echarts from "echarts";
import { onMounted, ref, watch } from "vue";
import { useTheme } from "vuetify";
import { dateFormater, miniFullscreen } from "@/utils/common";
import { FlowTypes } from "@/utils/constant";
import { doApi } from "@/utils/api";
import type { CommonChartData, CommonChartQuery } from "~/utils/model";
import DatasFlowTable from "@/components/datas/FlowTable.vue";

const theme = useTheme();

// 使用 props 来接收外部传入的参数
const { title, width, height } = defineProps(["title", "width", "height"]);

const searchDrawer = ref(false);

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
    // trigger: "legend",
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
    // top: 'bottom',
    // left: '0',
    // orient: 'vertical', // 图例的排列方向
    textStyle: {
      color: "#000", // 图例文字颜色
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
      name: "支出类型",
      type: "pie",
      radius: ["50%", "80%"], // 饼图的半径，数组的第一项是内半径，第二项是外半径
      // center: ['10%', '30%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10, // 饼图扇形的边框弧度
        borderColor: "#fff", // 饼图扇形的边框颜色
        borderWidth: 1, // 饼图扇形的边框线宽
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

let typePieDiv: any;
let typePieChart: echarts.ECharts;

const doQuery = (query: CommonChartQuery) => {
  doApi
    .post<CommonChartData[]>("api/entry/analytics/industryType", {
      bookId: localStorage.getItem("bookId"),
      ...query,
    })
    .then((res) => {
      if (res) {
        if (res.length === 0) {
          // console.log("TypePieChart未查询到数据！");
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
          res.sort((a, b) => Number(b.inSum) - Number(a.inSum));
          res.forEach((data) => {
            dataList.push({
              value: Number(data.inSum).toFixed(2),
              name: data.type,
            });
          });
        } else {
          res.sort((a, b) => Number(b.zeroSum) - Number(a.zeroSum));
          res.forEach((data) => {
            dataList.push({
              value: Number(data.zeroSum).toFixed(2),
              name: data.type,
            });
          });
        }
        optionRef.value.series[0].data = dataList;
        optionRef.value.legend.textStyle.color =
          theme.global.name.value == "dark" ? "#fff" : "#000";
        optionRef.value.series[0].itemStyle.borderColor =
          theme.global.name.value == "dark" ? "#fff" : "#000";
        typePieChart.setOption(optionRef.value);
      }
    });
};
watch(chartParam.value, () => {
  doQuery(chartParam.value);
});

const query = ref<FlowQuery>({ pageNum: 1, pageSize: 20 });
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

  typePieDiv = document.getElementById("typePieDiv");
  typePieChart = echarts.init(typePieDiv);
  typePieChart.on("click", function (param) {
    query.value = { ...chartParam.value, industryType: param.name };
    showFlowTable.value = true;
  });
  doQuery(chartParam.value);
});
</script>

<style scoped>
#typePieDiv {
  padding: 0.5rem;
}
</style>
