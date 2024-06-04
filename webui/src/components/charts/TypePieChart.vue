<template>
  <el-row class="queryRow">
    <h4 class="row-header">{{ title }}</h4>
    <div class="row-header queryParam">
      <el-date-picker
        v-model="queryRef.startDay"
        type="date"
        style="width: auto"
        format="YYYY/MM/DD"
        value-format="YYYY-MM-DD"
        placeholder="开始时间"
      />
    </div>
    <div class="row-header queryParam">
      <el-date-picker
        v-model="queryRef.endDay"
        style="width: auto"
        type="date"
        format="YYYY/MM/DD"
        value-format="YYYY-MM-DD"
        placeholder="结束时间"
      />
    </div>
    <div class="row-header queryParam">
      <el-select v-model="queryRef.flowType" class="m-2" placeholder="流水类型">
        <el-option
          v-for="item in flowTypeOptions"
          :key="item.value"
          :label="item.value"
          :value="item.value"
        />
      </el-select>
    </div>
<!--    <div class="row-header pc-button">-->
<!--      <el-button :icon="Search" circle @click="doQuery(queryRef)" />-->
<!--    </div>-->
  </el-row>

  <el-row class="mini-buttons">
    <div class="queryParam">
      <el-date-picker
        v-model="queryRef.endDay"
        type="date"
        format="YYYY/MM/DD"
        value-format="YYYY-MM-DD"
        placeholder="结束时间"
      />
    </div>
    <div class="queryParam">
      <el-button :icon="Search" circle @click="doQuery(queryRef)" />
    </div>
  </el-row>
  <div id="typePieDiv" :style="style"></div>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { onMounted, ref, watch } from 'vue'
import { typePie } from '@/api/api.analysis'
import { flowQuery, resetFlowQuery } from '@/utils/store'
import { isDark } from '@/utils/common'
import type { TypePieChartQuery } from '@/types/model/analysis'
import { showFlowTableDialog } from '@/stores/flag'

// 使用 props 来接收外部传入的参数
const { title, style } = defineProps(['title', 'style'])

const query: TypePieChartQuery = {
  flowType: '支出'
}
// 流水类型
const flowTypeOptions = ref<any[]>([{ value: '支出' }, { value: '收入' }, { value: '不计收支' }])

const queryRef = ref(query)

const dataList: any[] = []

const optionRef = ref({
  tooltip: {
    trigger: 'item'
  },
  legend: {
    top: '5%',
    left: '0',
    orient: 'vertical',
    textStyle: {
      color: '#fff'
    }
  },
  toolbox: {
    feature: {
      // 下载按钮
      // saveAsImage: {}
    }
  },
  series: [
    {
      name: '消费类型',
      type: 'pie',
      radius: ['60%', '80%'],
      // center: ['10%', '30%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      // grid: {
      //   left: '30',
      //   top: '20',
      //   right: '30',
      //   buttom: '20'
      // },
      label: {
        show: true,
        position: 'center',
        formatter(param: any) {
          // correct the percentage
          return param.name + ' (' + param.percent + '%)'
        }
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '40',
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: dataList
    }
  ]
})

let typePieDiv: any
let typePieChart: echarts.ECharts

const doQuery = (query: TypePieChartQuery) => {
  flowQuery.startDay = queryRef.value.startDay
  flowQuery.endDay = queryRef.value.endDay
  typePie(query).then((res) => {
    if (res) {
      if (res.length === 0) {
        console.log('TypePieChart未查询到数据！')
        return
      }
      dataList.length = 0
      res.forEach((data) => {
        dataList.push({
          value: Number(data.typeSum).toFixed(2),
          name: data.type
        })
      })
      optionRef.value.series[0].data = dataList
      optionRef.value.legend.textStyle.color = isDark.value.valueOf() ? '#fff' : '#000'

      if (document.body.clientWidth <= 480) {
        optionRef.value.series[0].radius = ['30%', '50%']
      }

      typePieDiv = document.getElementById('typePieDiv')
      typePieChart = echarts.init(typePieDiv)
      typePieChart.setOption(optionRef.value)
      typePieChart.on('click', function(param) {
        resetFlowQuery()
        flowQuery.startDay = queryRef.value.startDay
        flowQuery.endDay = queryRef.value.endDay
        flowQuery.type = param.name
        flowQuery.flowType = queryRef.value.flowType
        showFlowTableDialog.value.visible = true
      })
    }
  })
}
watch(queryRef.value, () => {
  doQuery(queryRef.value)
})

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


.row-header {
  margin: auto 0.5rem;
}

.queryParam {
  width: 10rem;
}

#typePieDiv {
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

  #typePieDiv {
    font-size: small;
  }

  #typePieDiv > div > canvas {
    margin: 20px;
  }
}
</style>
