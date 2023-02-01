<template>
    <el-calendar>
        <template #date-cell="{ data }">
            <div @click="clickDay(data)">
                <p :class="data.isSelected ? 'is-selected' : ''">
                    {{ data.day.split('-').slice(1).join('-') }}
                    {{ data.isSelected ? '✔️' : '' }}
                </p>
                <p :class="allCount[data.day] ? 'have-flow' : 'no-flow'">
                    {{ allCount[data.day] ? Number(allCount[data.day].toFixed(2)) : 0 }}
                </p>
            </div>
        </template>
    </el-calendar>
</template>
  
<script setup lang="ts">
import { flowQuery, chartDialog } from '../utils/store';
import { dailyLine } from '../api/api.analysis'
import type { DailyLineChartQuery } from '@/types/model/analysis';
import { ref } from 'vue';

const allCount = ref<any>({});

const doQuery = async (param: DailyLineChartQuery) => {
    const res = await dailyLine(param);
    return res;
}

const clickDay = (param: any) => {
    flowQuery.startDay = param.day;
    flowQuery.endDay = param.day;
    chartDialog.chartDiaLogShow = false;
    console.log(param);
}

const query: DailyLineChartQuery = {
}
const queryRef = ref(query);

doQuery(queryRef.value).then((res) => {
    res.forEach((data) => {
        allCount.value[data._id] = data.daySum;
    });
});

</script>
<style>
.is-selected {
    color: #1989fa;
}
.have-flow {
    color: #f56c6c;
}
.no-flow {
    color: #67c23a;
}
</style>