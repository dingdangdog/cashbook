<template>
    <div class="calendar-main">
        <el-calendar ref="refCalendar" v-model="day">
            <template #header="{ date }">
                <span>{{ date }} <b>消费总额：{{ monthCount[date] ? Number(monthCount[date]).toFixed(2) : 0 }} </b></span>
                <el-row class="mini-button-group">
                    <el-button-group>
                        <el-button @click="selectDate('prev-month')">上个月</el-button>
                        <el-button @click="selectDate('today')">今天</el-button>
                        <el-button @click="selectDate('next-month')">下个月</el-button>
                    </el-button-group>
                </el-row>
            </template>

            <template #date-cell="{ data }">
                <div @click="clickDay(data)">
                    <p :class="data.day === flowQuery.startDay ? 'is-selected' : ''">
                        {{ data.day.split('-').slice(1).join('-') }}
                        {{ data.day === flowQuery.startDay ? '✔️' : '' }}
                    </p>
                    <p :class="moneyClass(allCount[data.day])" style="display: flex; justify-content: right;">
                        {{ allCount[data.day] ? Number(allCount[data.day]).toFixed(2) : 0 }}
                    </p>
                </div>
            </template>
        </el-calendar>
    </div>
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
        // 天集合
        allCount.value[data.day] = data.daySum;
        // 月集合
        let month = dayToMonth(data.day);
        let count = monthCount.value[month] ? monthCount.value[month] : 0;
        monthCount.value[month] = count + Number(data.daySum);
    });
    console.log(monthCount.value);
});

const dayToMonth = (day: string) => {
    let date = new Date(day);
    let year = date.getFullYear().toString();
    let month = (date.getMonth() + 1).toString();
    return year + ' 年 ' + month + ' 月';
}

const moneyClass = (money: any) => {
    if (!money || money == 0) {
        return 'no-flow';
    } else if (money >= 1000) {
        return 'thousand-flow';
    } else if (money >= 500) {
        return 'five-hundred-flow';
    } {
        return 'have-flow';
    }
}
</script>
<style>
.is-selected {
    color: #1989fa;
}

.thousand-flow {
    color: #f56c6c;
}
.five-hundred-flow {
    color: #d485e1;
}
/* .hundred-flow {
    color: #f6b204;
} */
.have-flow {
    /* color: #1fbbf8; */
    color: #f6b204;
}

.no-flow {
    color: #67c23a;
}

.el-calendar__body {
    padding: 0 20px;
}

@media screen and (max-width: 480px) {
    .calendar-main {
        font-size: small;
    }

    .el-calendar {
        width: 100%;
        height: auto;
        font-size: smaller;
    }

    .el-dialog__body {
        padding: 0;
    }

    .el-button {
        font-size: small;
    }

    .el-calendar__header {
        padding: 10px;
    }

    .el-calendar__header>span {
        width: 100%;
        margin: 5px 5px;
        font-size: small;
    }

    .el-calendar__body {
        padding: 0 10px;
    }

    .mini-button-group {
        /* display: inline; */
        display: flex;
        flex-wrap: wrap;
    }
}
</style>