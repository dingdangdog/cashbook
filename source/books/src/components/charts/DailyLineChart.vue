<template>
  <h4>{{ title }}</h4>
  <div id="lineDiv" :style="style"></div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { onMounted, ref } from 'vue'
import { dailyLine } from '@/api/api.analysis'
import { dateFormater } from '@/utils/common'
import type { DailyLineChartQuery } from '@/types/model/analysis'

// 使用 props 来接收外部传入的参数
const { title, style } = defineProps(['title', 'style'])

// 横轴数据
const xAxisList: string[] = []
// 支出数据
const dataListOut: string[] = []
// 收入数据
const dataListIn: string[] = []
// 不计收支数据
const notInOut: string[] = []

const optionRef = ref({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross'
    }
  },
  legend: {
    selected: {
      '支出': true,
      '收入': true,
      '不计收支': false
    },
    data: [
      {
        name: '支出',
        textStyle: {
          color: 'rgb(217,159,8)'
        }
      },
      {
        name: '收入',
        textStyle: {
          color: 'rgb(76, 152, 112)'
        }
      },
      {
        name: '不计收支',
        textStyle: {
          color: 'rgb(66, 66, 66)'
        }
      }
    ] // 系列的名称，与 series 中的 name 对应
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
    min: '0.00'
  },
  series: [
    {
      name: '支出',
      type: 'line',
      symbol: 'circle',
      symbolSize: 6,
      areaStyle: {},
      itemStyle: {
        color: 'rgb(217,159,8)' // 支出颜色
      },
      emphasis: {
        focus: 'series'
      },
      data: dataListOut
    },
    {
      name: '收入',
      type: 'line',
      symbol: 'circle',
      symbolSize: 6,
      areaStyle: {},
      itemStyle: {
        color: 'rgb(76, 152, 112)' // 收入颜色
      },
      emphasis: {
        focus: 'series'
      },
      data: dataListIn
    },
    {
      name: '不计收支',
      type: 'line',
      symbol: 'circle',
      visible: false,
      symbolSize: 6,
      areaStyle: {},
      itemStyle: {
        color: 'rgb(66, 66, 66)' // 收入颜色
      },
      emphasis: {
        focus: 'series'
      },
      data: notInOut
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
  doQuery({}).then((res) => {
    if (res) {
      if (res.length === 0) {
        console.log('DailyLineChart未查询到数据！')
        return
      }
      xAxisList.length = 0
      dataListOut.length = 0
      notInOut.length = 0
      res.forEach((data) => {
        xAxisList.push(dateFormater('YYYY-MM-dd', data.day))
        dataListOut.push(Number(data.daySum).toFixed(2))
        dataListIn.push(Number(data.inSum).toFixed(2))
        notInOut.push(Number(data.zeroSum).toFixed(2))
      })
      optionRef.value.xAxis.data = xAxisList
      optionRef.value.series[0].data = dataListOut
      optionRef.value.series[1].data = dataListIn
      optionRef.value.series[2].data = notInOut
      optionRef.value.dataZoom[0].start = zoomChange(xAxisList.length)
      optionRef.value.dataZoom[1].start = zoomChange(xAxisList.length)
      optionRef.value.dataZoom[2].start = zoomChange(xAxisList.length)

      lineDiv = document.getElementById('lineDiv')
      lineChart = echarts.init(lineDiv)
      lineChart.setOption(optionRef.value)
    }
  })
})
</script>

<style scoped>
#lineDiv {
  padding: 10px;
}

@media screen and (max-width: 480px) {
  #lineDiv {
    font-size: small;
  }
}
</style>
