<template>
  <h4>每日流水统计</h4>
  <div id="lineDiv"></div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { onMounted, ref } from 'vue'
import { dailyLine } from '@/api/api.analysis'
import { dateFormater } from '@/utils/common'
import type { DailyLineChartQuery } from '@/types/model/analysis'

// 横轴数据
const xAxisList: string[] = []
// 支出数据
const dataListOut: string[] = []
// 收入数据
const dataListIn: string[] = []

const optionRef = ref({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
    }
  },
  legend: {
    data: [
      {
        name: '每日支出曲线',
        textStyle: {
          color: 'rgb(217,159,8)',
        },
      },
      {
        name: '每日收入曲线',
        textStyle: {
          color: 'rgb(76, 152, 112)',
        },
      },
    ], // 系列的名称，与 series 中的 name 对应
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
    type: 'value',
    min: '0.00',
  },
  series: [
    {
      name: '每日支出曲线',
      type: 'line',
      symbol: 'circle',
      symbolSize: 6,
      areaStyle: {},
      itemStyle: {
        color: 'rgb(217,159,8)', // 支出颜色
      },
      emphasis: {
        focus: 'series'
      },
      data: dataListOut
    },
    {
      name: '每日收入曲线',
      type: 'line',
      symbol: 'circle',
      symbolSize: 6,
      areaStyle: {},
      itemStyle: {
        color: 'rgb(76, 152, 112)', // 收入颜色
      },
      emphasis: {
        focus: 'series'
      },
      data: dataListIn
    }
  ]
})

let lineDiv: any
let lineChart: echarts.ECharts

const doQuery = async (query: DailyLineChartQuery) => {
  return await dailyLine(query)
}

// 缩放比例动态计算，保证美观
const zoomChange = (total: number): number => {
  return (Math.ceil(total / 30) - 1) * 10
}

onMounted(() => {
  doQuery({}).then( (res) => {
    if (res) {
      if (res.length === 0) {
        ElMessage.error('未查询到数据！')
        return
      }
      xAxisList.length = 0
      dataListOut.length = 0
      res.forEach((data) => {
        xAxisList.push(dateFormater('YYYY-MM-dd', data.day))
        dataListOut.push(Number(data.daySum).toFixed(2))
        dataListIn.push(Number(data.inSum).toFixed(2))
      })
      console.log(dataListOut)
      console.log(dataListIn)
      optionRef.value.xAxis.data = xAxisList
      optionRef.value.series[0].data = dataListOut
      optionRef.value.series[1].data = dataListIn
      optionRef.value.dataZoom[0].start = zoomChange(xAxisList.length)
      optionRef.value.dataZoom[1].start = zoomChange(xAxisList.length)

      lineDiv = document.getElementById('lineDiv')
      lineChart = echarts.init(lineDiv)
      lineChart.setOption(optionRef.value)
    }
  })
})
</script>

<style scoped>
#lineDiv {
  width: 100%;
  height: 400px;
  padding: 10px;
}

@media screen and (max-width: 480px) {
  #lineDiv {
    font-size: small;
  }
}
</style>
