<template>
  <el-row class="queryRow">
    <div class="queryParam">
      <el-date-picker v-model="queryRef.startDay" type="date" format="YYYY/MM/DD" value-format="YYYY-MM-DD"
        placeholder="开始时间" />
    </div>
    <div class="queryParam pc-button">
      <el-date-picker v-model="queryRef.endDay" type="date" format="YYYY/MM/DD" value-format="YYYY-MM-DD"
        placeholder="结束时间" />
    </div>
    <div class="queryParam pc-button">
      <el-button :icon="Search" circle @click="doQuery()" />
    </div>
  </el-row>

  <el-row class="mini-buttons">
    <div class="queryParam">
      <el-date-picker v-model="queryRef.endDay" type="date" format="YYYY/MM/DD" value-format="YYYY-MM-DD"
        placeholder="结束时间" />
    </div>
    <div class="queryParam">
      <el-button :icon="Search" circle @click="doQuery()" />
    </div>
  </el-row>
  <div id="pieDiv">
  </div>
</template>

<script setup lang="ts">
import type { TypePieChartQuery } from '@/types/model/analysis';
import { Search } from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import { ElMessage } from 'element-plus';
import { onMounted, ref } from 'vue';
import { monthBar } from '../api/api.analysis';
import { flowQuery, chartDialog } from '../utils/store';

const query: TypePieChartQuery = {
}
const queryRef = ref(query);

const dataList: any[] = [];
const xAxisList: any[] = [];
const colors: any[] = [];

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
    type: 'category',
    data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      data: [120, 200, 150, 80, 70, 110, 130],
      type: 'bar'
    }
  ]
});

var pieDiv: any;
var pieChart: echarts.ECharts;

const doQuery = () => {
  flowQuery.startDay = queryRef.value.startDay;
  flowQuery.endDay = queryRef.value.endDay;
  monthBar().then(res => {
    if (res) {
      if (res.length === 0) {
        ElMessage.error("未查询到数据！");
        return;
      }
      dataList.length = 0;
      res.forEach((data) => {
        xAxisList.push(data.type);
        dataList.push(Number(data.typeSum).toFixed(2));
        colors.push(getRandomColor());
      })
      optionRef.value.series[0].data = dataList;
      optionRef.value.xAxis.data = xAxisList;

      pieDiv = document.getElementById('pieDiv');
      pieChart = echarts.init(pieDiv);
      pieChart.setOption(optionRef.value);
      pieChart.on('click', function (param) {
        flowQuery.startDay = queryRef.value.startDay;
        flowQuery.endDay = queryRef.value.endDay;
        flowQuery.payType = param.name;
        chartDialog.chartDiaLogShow = false;
      });
    }
  })
}

const getRandomColor = () => {
  var letters = '6789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 10)];
  }
  return color;
}

onMounted(() => {
  queryRef.value.startDay = flowQuery.startDay;
  queryRef.value.endDay = flowQuery.endDay;
  doQuery();
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
  padding: 10px
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

  #pieDiv>div>canvas {
    margin: 20px;
  }
}
</style>