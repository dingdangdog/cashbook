<template>
  <h4>每月流水统计</h4>
  <div id="pieDiv"></div>
</template>

<script setup lang="ts">
import type { TypePieChartQuery } from '@/types/model/analysis'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { onMounted, ref } from 'vue'
import { monthBar } from '../api/api.analysis'
import { flowQuery, chartDialog, resetFlowQuery } from '../utils/store'

const query: TypePieChartQuery = {}
const queryRef = ref(query)

const dataList: any[] = []
const xAxisList: any[] = []
const colors: any[] = []

const optionRef = ref({
  color: colors,
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },

  toolbox: {
    feature: {
      saveAsImage: {}
    }
  },
  xAxis: {
    name: '年月',
    type: 'category',
    data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月']
  },
  yAxis: {
    name: '金额(元)',
    type: 'value'
  },
  series: [
    {
      data: [120, 200, 150, 80, 70, 110, 130],
      type: 'bar'
    }
  ]
})

var pieDiv: any
var pieChart: echarts.ECharts

const doQuery = () => {
  monthBar().then((res) => {
    if (res) {
      if (res.length === 0) {
        ElMessage.error('未查询到数据！')
        return
      }
      dataList.length = 0
      res.forEach((data) => {
        xAxisList.push(data.type)
        dataList.push(Number(data.typeSum).toFixed(2))
        colors.push(getRandomColor())
      })
      optionRef.value.series[0].data = dataList
      optionRef.value.xAxis.data = xAxisList

      pieDiv = document.getElementById('pieDiv')
      pieChart = echarts.init(pieDiv)
      pieChart.setOption(optionRef.value)
      pieChart.on('click', function (param) {
        resetFlowQuery()
        flowQuery.startDay = param.name + '-01'
        flowQuery.endDay = param.name + '-31'
        chartDialog.chartDiaLogShow = false
      })
    }
  })
}

const getRandomColor = () => {
  var letters = '6789ABCDEF'
  var color = '#'
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 10)]
  }
  return color
}

onMounted(() => {
  queryRef.value.startDay = flowQuery.startDay
  queryRef.value.endDay = flowQuery.endDay
  doQuery()
})
</script>

<style scoped>
.queryRow {
  margin: 8px 3px;
}

.queryParam {
  margin: 8px 3px;
}

#pieDiv {
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

  #pieDiv {
    font-size: small;
  }

  #pieDiv > div > canvas {
    margin: 20px;
  }
}
</style>
