<template>
  <div class="calendar-main">
    <el-calendar ref="refCalendar" v-model="day">
      <template #header="{ date }">
        <span>
          {{ date }}
          &nbsp; 总收入：<b>{{ inMonthCount[date] ? Number(inMonthCount[date]).toFixed(2) : 0 }} </b>
          &nbsp; 总支出：<b>{{ outMonthCount[date] ? Number(outMonthCount[date]).toFixed(2) : 0 }} </b>
          &nbsp; 消费限额：<b>{{ plan.limitMoney }} </b>
        </span>
        <el-row class="mini-button-group">
          <el-button-group>
            <el-button @click="changeDate('prev-month')">上个月</el-button>
            <el-button @click="changeDate('today')">今天</el-button>
            <el-button @click="changeDate('next-month')">下个月</el-button>
          </el-button-group>
        </el-row>
      </template>

      <template #date-cell="{ data }">
        <div @click="clickDay(data)">
          <p :class="data.day === flowQuery.startDay ? 'is-selected' : ''">
            {{ data.day.split('-').slice(1).join('-') }}
            {{ data.day === flowQuery.startDay ? '✔️' : '' }}
          </p>
          <p :class="outMoneyClass(outDayCount[data.day])" v-if="noZero(outDayCount[data.day])" style="display: flex; justify-content: right">
            支：{{ outDayCount[data.day] ? Number(outDayCount[data.day]).toFixed(2) : 0 }}
          </p>
          <p :class="inMoneyClass(inDayCount[data.day])" v-if="noZero(inDayCount[data.day])" style="display: flex; justify-content: right">
            收：{{ inDayCount[data.day] ? Number(inDayCount[data.day]).toFixed(2) : 0 }}
          </p>
        </div>
      </template>
    </el-calendar>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { dailyLine } from '@/api/api.analysis'
import { getPlan } from '@/api/api.plan'
import type { Plan } from '@/types/model/plan'
import type { DailyLineChartQuery } from '@/types/model/analysis'
import { dateFormater } from '@/utils/common'
import { flowQuery, resetFlowQuery } from '@/utils/store'
import { showFlowTableDialog } from '@/stores/flag'

// 获取今天日期
const day = ref(new Date())

const doQuery = async (param: DailyLineChartQuery) => {
  return await dailyLine(param)
}
// 支出相关数据存储实体
const outMonthCount = ref<any>({})
const outDayCount = ref<any>({})
// 收入相关数据存储实体
const inMonthCount = ref<any>({})
const inDayCount = ref<any>({})

// 日期点击事件
const clickDay = (param: any) => {
  resetFlowQuery()
  flowQuery.startDay = param.day
  flowQuery.endDay = param.day
  day.value = new Date(param.day)
  showFlowTableDialog.value.visible = true
  // console.log(param)
}

const nowDate = ref(new Date())
const refCalendar = ref()

// 月份变更
const changeDate = (value: any) => {
  if (refCalendar.value) {
    refCalendar.value.selectDate(value)

    if (value == 'prev-month') {
      nowDate.value.setMonth(nowDate.value.getMonth() - 1)
    } else if (value == 'next-month') {
      nowDate.value.setMonth(nowDate.value.getMonth() + 1)
    } else {
      nowDate.value = new Date()
    }
    getPlan(dateFormater('YYYY-MM', nowDate.value)).then((res) => {
      plan.value = res
    })
  }
}

// 根据日期获取月份
const dayToMonth = (day: string) => {
  let date = new Date(day)
  let year = date.getFullYear().toString()
  let month = (date.getMonth() + 1).toString()
  return year + ' 年 ' + month + ' 月'
}

const plan = ref<Plan>({})

const outMoneyClass = (money: any) => {
  if (!money || money == 0) {
    return 'no-flow'
  } else if (money >= 1000) {
    return 'thousand-flow'
  } else if (money >= 500) {
    return 'five-hundred-flow'
  } else {
    return 'have-flow'
  }
}
const inMoneyClass = (money: any) => {
  if (!money || money == 0) {
    return 'no-in'
  } else {
    return 'have-in'
  }
}

const noZero = (money: any) => {
  return !(!money || money == 0);
}

const initQuery = () => {
  inMonthCount.value = {}
  inDayCount.value = {}
  outMonthCount.value = {}
  outDayCount.value = {}
  // 支出数据查询
  doQuery({}).then((res) => {
    res.forEach((data) => {
      // 月集合
      let month = dayToMonth(data.day)
      // 支出
      outDayCount.value[data.day] = data.daySum
      let count = outMonthCount.value[month] ? outMonthCount.value[month] : 0
      outMonthCount.value[month] = count + Number(data.daySum)
      // 收入
      inDayCount.value[data.day] = data.inSum
      let inCount = inMonthCount.value[month] ? inMonthCount.value[month] : 0
      inMonthCount.value[month] = inCount + Number(data.inSum)
    })
    console.log(outMonthCount.value)
  })

  // 限额数据查询
  getPlan(dateFormater('YYYY-MM', nowDate.value)).then((res) => {
    plan.value = res
  })
}

initQuery()

let bookId = localStorage.getItem("bookId")
onMounted(()=>{
  setInterval(() => {
    if (bookId != localStorage.getItem("bookId") || localStorage.getItem("changePlan") === "true") {
      bookId = localStorage.getItem("bookId")
      initQuery()
      localStorage.setItem("changePlan", "false")
    }
  }, 500)
})
</script>
<style>
.calendar-main {
  padding: 1rem;
  border-radius: 10px;
  border: solid 1px var(--el-menu-border-color);
}

.el-calendar-table .el-calendar-day {
  height: calc(var(--el-calendar-cell-width) * 1.5);
}

.is-selected {
  color: #1989fa;
}

.thousand-flow {
  color: #f56c6c;
}
.five-hundred-flow {
  color: #d485e1;
}

.have-flow {
  color: #cc9200;
}

.no-flow, .have-in {
  color: #2f8f00;
}

.no-in {
  color: var(--el-text-color-placeholder)
}

.el-calendar__body {
  padding: 0 1rem;
}

@media screen and (max-width: 1660px) {
  .el-calendar-table .el-calendar-day {
    height: calc(var(--el-calendar-cell-width) * 1.2);
  }
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

  .el-calendar__header > span {
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
