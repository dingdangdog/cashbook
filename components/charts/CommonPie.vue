<template>
  <div class="w-full">
    <div class="md:h-16 mb-2 relative">
      <h4 class="text-center font-semibold text-green-950 dark:text-white my-2">
        {{ title }}
      </h4>
      <span
        class="absolute left-0 top-0 text-xs text-blue-500 dark:text-blue-400 hover:text-blue-700 cursor-pointer rounded-md shadow-sm transition-colors"
        @click="toggleLegend()"
      >
        {{ showLegend ? "隐藏图例" : "显示图例" }}
      </span>
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
      class="w-full max-w-6xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden"
      @click.stop
    >
      <div
        class="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700"
      >
        <h3 class="text-lg font-semibold text-green-950 dark:text-white">
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
import { doApi } from "@/utils/api";
import type { CommonChartData, CommonChartQuery } from "~/utils/model";
import DatasFlowTable from "@/components/datas/FlowTable.vue";

const { isDark } = useAppTheme();

// 定义组件的props
interface Props {
  title: string;
  width: string;
  height: string;
  groupBy: string; // 新增：分组字段 (payType/industryType/attribution)
  startDay?: string;
  endDay?: string;
  flowType?: string;
  seriesName?: string; // 新增：系列名称
  showLegend?: boolean; // 新增：是否显示图例
  queryField?: string; // 新增：点击时传递给FlowTable的查询字段名
}

const props = withDefaults(defineProps<Props>(), {
  seriesName: "数据分析",
  showLegend: true,
  queryField: "payType", // 默认为payType，保持向下兼容
});

// 生成唯一ID避免冲突
const chartId = ref(`commonPieDiv-${Math.random().toString(36).substr(2, 9)}`);

const chartParam = ref<CommonChartQuery & { groupBy: string }>({
  startDay: props.startDay,
  endDay: props.endDay,
  flowType: props.flowType,
  groupBy: props.groupBy,
});

const dataList: any[] = [];
const noData = ref(false);

const optionRef = ref({
  tooltip: {
    trigger: "item",
  },
  legend: {
    show: props.showLegend, // 根据props控制图例显示
    tooltip: {
      formatter: function (legend: any) {
        // 找到对应的类型，显示数值
        for (let d of dataList) {
          if (legend.name == d.name) {
            return `${legend.name}: ${d.value}`;
          }
        }
        return `未找到${legend.name}`;
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
      name: props.seriesName,
      type: "pie",
      radius: ["50%", "80%"],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: "#d1d5db",
        borderWidth: 1,
      },
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

let chartDiv: any;
let chart: echarts.ECharts;

const doQuery = (query: CommonChartQuery & { groupBy: string }) => {
  doApi
    .post<CommonChartData[]>("api/entry/analytics/common", {
      bookId: localStorage.getItem("bookId"),
      ...query,
    })
    .then((res) => {
      if (res) {
        if (res.length === 0) {
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

        // 重新渲染图表
        optionRef.value.series[0].data = dataList;
        optionRef.value.legend.textStyle.color = isDark.value
          ? "#e5e7eb"
          : "#374151";
        optionRef.value.series[0].itemStyle.borderColor = isDark.value
          ? "#4b5563"
          : "#d1d5db";

        // 确保图表完全重新渲染
        chart.clear();
        chart.setOption(optionRef.value);
      }
    });
};

const showLegend = ref(props.showLegend);

const toggleLegend = () => {
  showLegend.value = !showLegend.value;
};

watch(showLegend, () => {
  optionRef.value.legend.show = showLegend.value;
  chart.setOption(optionRef.value);
});

watch(chartParam.value, () => {
  doQuery(chartParam.value);
});

const query = ref();
const showFlowTable = ref(false);

onMounted(() => {
  // 根据屏幕尺寸和图例显示设置调整布局
  if (props.showLegend) {
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
  } else {
    // 不显示图例时，图表居中
    // @ts-ignore
    optionRef.value.series[0].center = ["50%", "50%"];
  }

  chartDiv = document.getElementById(chartId.value);
  const oldInstance = echarts.getInstanceByDom(chartDiv);
  if (oldInstance) {
    oldInstance.dispose();
  }
  chart = echarts.init(chartDiv);
  chart.on("click", function (param) {
    // 根据queryField动态设置查询参数
    query.value = {
      ...chartParam.value,
      [props.queryField]: param.name,
    };
    showFlowTable.value = true;
  });
  doQuery(chartParam.value);
});
</script>

<style scoped></style>
