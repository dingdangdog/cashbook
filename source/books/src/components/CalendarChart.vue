<template>
    <el-calendar ref="refCalendar" v-model="day">
        <template #header="{ date }">
            <span>{{ date }} <b>消费总额：{{ monthCount[date] ? Number(monthCount[date].toFixed(2)) : 0 }} </b></span>
            <el-button-group>
                <el-button @click="selectDate('prev-month')">上个月</el-button>
                <el-button @click="selectDate('today')">今天</el-button>
                <el-button @click="selectDate('next-month')">下个月</el-button>
            </el-button-group>
        </template>
        <template #date-cell="{ data }">
            <div @click="clickDay(data)">
                <p :class="data.day === flowQuery.startDay ? 'is-selected' : ''">
                    {{ data.day.split('-').slice(1).join('-') }}
                    {{ data.day === flowQuery.startDay ? '✔️' : '' }}
                </p>
                <p :class="allCount[data.day] ? 'have-flow' : 'no-flow'">
                    {{ allCount[data.day]? Number(allCount[data.day].toFixed(2)) : 0 }}
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

const day = ref(flowQuery.startDay ? new Date(flowQuery.startDay) : new Date());

const doQuery = async (param: DailyLineChartQuery) => {
    const res = await dailyLine(param);
    return res;
}
const monthCount = ref<any>({});

const clickDay = (param: any) => {
    flowQuery.startDay = param.day;
    flowQuery.endDay = param.day;
    day.value = new Date(param.day);
    chartDialog.chartDiaLogShow = false;
    console.log(param);
}

const refCalendar = ref();
const selectDate = (value: any) => {
    if (refCalendar.value) {
        refCalendar.value.selectDate(value);
    }
}

const query: DailyLineChartQuery = {
}
const queryRef = ref(query);

doQuery(queryRef.value).then((res) => {
    res.forEach((data) => {
        allCount.value[data._id] = data.daySum;
        let month = dayToMonth(data._id);
        let count = monthCount.value[month] ? monthCount.value[month] : 0;
        monthCount.value[month] = count + data.daySum;
    });
});

const dayToMonth = (day: string) => {
    let date = new Date(day);
    let year = date.getFullYear().toString();
    let month = (date.getMonth() + 1).toString();
    return year + ' 年 ' + month + ' 月';
}

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
.el-calendar__body{
    padding: 0 20px;
}
</style>