<template>
  <h4>每日流水统计</h4>
  <div id="lineDiv"></div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { onMounted, ref } from 'vue'
import { dailyLine } from '@/api/api.analysis'
import { flowQuery, resetFlowQuery } from '@/utils/store'
import { dateFormater } from '@/utils/common'
import type { DailyLineChartQuery } from '@/types/model/analysis'

const query: DailyLineChartQuery = {
  flowType: '支出'
}
const queryRef = ref(query)

// 横轴数据
const xAxisList: string[] = []
// 纵轴数据
const dataList: string[] = []

const optionRef = ref({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#6a7985'
      }
    }
  },
  toolbox: {
    feature: {
      // 下载按钮
      // saveAsImage: {}
    }
  },
  dataZoom: [
    {
      type: 'inside',
      start: 80,
      end: 100
    },
    {
      start: 80,
      end: 100
    }
  ],
  xAxis: {
    name: '日期',
    type: 'category',
    data: xAxisList
  },
  yAxis: {
    name: '金额(元)',
    show: true,
    type: 'value'
  },
  series: [
    {
      name: '每日消费统计',
      type: 'line',
      stack: 'Total',
      symbol: 'star',
      symbolSize: 10,
      areaStyle: {},
      emphasis: {
        focus: 'series'
      },
      data: dataList
    }
  ]
})

var lineDiv: any
var lineChart: echarts.ECharts

const doQuery = (query: DailyLineChartQuery) => {
  resetFlowQuery()
  flowQuery.startDay = queryRef.value.startDay
  flowQuery.endDay = queryRef.value.endDay
  dailyLine(query).then((res) => {
    if (res) {
      if (res.length === 0) {
        ElMessage.error('未查询到数据！')
        return
      }
      xAxisList.length = 0
      dataList.length = 0
      res.forEach((data) => {
        xAxisList.push(dateFormater('YYYY-MM-dd', data.day))
        dataList.push(Number(data.daySum).toFixed(2))
      })
      optionRef.value.xAxis.data = xAxisList
      optionRef.value.series[0].data = dataList
      optionRef.value.dataZoom[0].start = zoomChange(xAxisList.length)
      optionRef.value.dataZoom[1].start = zoomChange(xAxisList.length)

      lineDiv = document.getElementById('lineDiv')
      lineChart = echarts.init(lineDiv)
      lineChart.setOption(optionRef.value)
      // lineChart.on('click', function (){
      //   flowQuery.startDay = queryRef.value.startDay;
      //   flowQuery.endDay = queryRef.value.endDay;
      // });
    }
  })
}

// 缩放比例动态计算，保证美观
const zoomChange = (total: number): number => {
  return (Math.ceil(total / 30) - 1) * 10
}

onMounted(() => {
  queryRef.value.startDay = flowQuery.startDay
  queryRef.value.endDay = flowQuery.endDay
  doQuery(queryRef.value)
})
</script>

<style scoped>
.queryRow {
  margin: 8px 3px;
}

.queryParam {
  margin: auto 0.5rem;
}

#lineDiv {
  width: 100%;
  height: 400px;
  padding: 10px;
}

@media screen and (min-width: 960px) {
  .mini-buttons {
    display: none;
  }
}

@media screen and (max-width: 480px) {
  .pc-button {
    display: none;
  }

  .mini-buttons {
    margin: 8px 3px;
  }

  #lineDiv {
    font-size: small;
  }
}
</style>
