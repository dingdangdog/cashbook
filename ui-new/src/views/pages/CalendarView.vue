<template>
  <div class="calendar-container">
    <div class="calendar-main">
      <v-calendar ref="calendar" :month="nowMonth" :year="nowYear" :events="events">
        <template v-slot:header="{ title }">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem">
            <div style="flex: 1; display: flex; align-items: center">
              <v-chip
                class="cursor-pointer"
                :color="getInMonth() > 0 ? 'success' : ''"
                @click="clickDay('', '收入')"
              >
                总收入：<b>{{ getInMonth() }} </b> </v-chip
              >&nbsp;
              <v-chip
                class="cursor-pointer"
                :color="getInMonth() > 0 ? 'error' : ''"
                @click="clickDay('', '支出')"
              >
                总支出：<b> {{ getOutMonth() }} </b> </v-chip
              >&nbsp;
              <v-chip :style="outPlan()" class="cursor-pointer">
                支出限额：<b>{{ plan.limitMoney }} </b>
              </v-chip>
            </div>
            <div
              style="flex: 1; display: flex; justify-content: space-between; align-items: center"
            >
              <!-- 上一月按钮 -->
              <v-btn icon @click="changeDate('prev-month')">
                <v-icon>mdi-chevron-left</v-icon>
              </v-btn>
              <h3>{{ dayToMonth(nowDate) }}</h3>
              <v-btn icon @click="changeDate('next-month')">
                <v-icon>mdi-chevron-right</v-icon>
              </v-btn>
            </div>
            <div style="flex: 1; text-align: right">
              <v-btn color="primary" @click="showMonthAnalysis(dayToMonth(nowDate))">
                当月分析
              </v-btn>
            </div>
          </div>
        </template>
        <template v-slot:event="{ day, allDay, event }">
          <p style="text-align: center; padding: 0.3rem 0.2rem">
            <v-chip
              class="cursor-pointer"
              :class="event.out ? outMoneyClass(event.money) : inMoneyClass(event.money)"
              @click="clickDay(event.day, String(event.title))"
            >
              {{ event.title }}: {{ event.money }}
            </v-chip>
          </p>
        </template>
      </v-calendar>
    </div>
    <v-dialog :width="'40rem'" v-model="monthAnalysisDialog">
      <v-card>
        <v-card-title>{{ monthTitle + ' 流水分析' }}</v-card-title>
        <v-card-text>
          <MonthAnalysis :month="monthTitle" />
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="monthAnalysisDialog = false"> 关闭 </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { dailyLine } from '@/api/api.analysis'
import { getPlan } from '@/api/api.plan'
import type { Plan } from '@/model/plan'
import type { DailyLineChartQuery } from '@/model/analysis'
import { dateFormater } from '@/utils/common'
import { flowQuery, resetFlowQuery, updatePlanFlag } from '@/utils/store'
import { showFlowTableDialog } from '@/stores/flag'
import { errorAlert } from '@/utils/alert'
import MonthAnalysis from '@/components/MonthAnalysis.vue'
import { VCalendar } from 'vuetify/labs/VCalendar'

// 获取今天日期
const day = ref(new Date())

const doQuery = async (param: DailyLineChartQuery) => {
  return await dailyLine(param)
}
// 支出相关数据存储实体
const outMonthCount = ref<any>({})
// key - 日期 value - 金额
const outDayCount = ref<any>({})
// 收入相关数据存储实体
const inMonthCount = ref<any>({})
// key - 日期 value - 金额
const inDayCount = ref<any>({})
const getInMonth = (): number => {
  const title = dayToMonth(nowDate.value)
  return Number(inMonthCount.value[title] ? Number(inMonthCount.value[title]).toFixed(2) : 0)
}
const getOutMonth = (): number => {
  const title = dayToMonth(nowDate.value)
  return Number(outMonthCount.value[title] ? Number(outMonthCount.value[title]).toFixed(2) : 0)
}

// 日期点击事件
const clickDay = (param: any, flowType?: string) => {
  // let month = dayToMonth(param)
  resetFlowQuery()
  flowQuery.value.startDay = param
  flowQuery.value.endDay = param.day
  if (flowType) {
    flowQuery.value.flowType = flowType
  }
  day.value = new Date(param)
  showFlowTableDialog.value.visible = true
  // console.log(param)
}

const nowDate = ref(new Date())
const nowYear = ref(new Date().getFullYear())
const nowMonth = ref(new Date().getMonth())
const calendar = ref()

// 月份变更
const changeDate = (value: any) => {
  if (value == 'prev-month') {
    nowDate.value.setMonth(nowDate.value.getMonth() - 1)
  } else if (value == 'next-month') {
    nowDate.value.setMonth(nowDate.value.getMonth() + 1)
  } else {
    nowDate.value = new Date()
  }
  nowMonth.value = nowDate.value.getMonth()
  nowYear.value = nowDate.value.getFullYear()
  getPlan(dateFormater('YYYY-MM', nowDate.value)).then((res) => {
    plan.value = res
  })
}

// 根据日期获取月份
const dayToMonth = (day: string | Date) => {
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
// 存储日历流水数据
const events = reactive<CalendarDate[]>([])
interface CalendarDate {
  title: string
  day: string
  start: Date
  end: Date
  color: string
  allDay: boolean
  out: boolean
  money: number
}
// 初始化日历数据
const initQuery = () => {
  inMonthCount.value = {}
  inDayCount.value = {}
  outMonthCount.value = {}
  outDayCount.value = {}
  // 支出数据查询
  doQuery({}).then((res) => {
    if (res.length === 0) {
      errorAlert('暂无数据')
    }
    res.forEach((data) => {
      // 月集合
      let month = dayToMonth(data.day)
      // 支出
      outDayCount.value[data.day] = data.daySum
      let count = outMonthCount.value[month] ? outMonthCount.value[month] : 0
      outMonthCount.value[month] = count + Number(data.daySum)

      events.push({
        title: `支出`,
        day: data.day,
        start: new Date(data.day),
        end: new Date(data.day),
        color: 'red',
        allDay: true,
        out: true,
        money: data.daySum
      })

      // 收入
      inDayCount.value[data.day] = data.inSum
      let inCount = inMonthCount.value[month] ? inMonthCount.value[month] : 0
      inMonthCount.value[month] = inCount + Number(data.inSum)

      events.push({
        title: `收入`,
        day: data.day,
        start: new Date(data.day),
        end: new Date(data.day),
        color: 'green',
        allDay: true,
        out: false,
        money: data.inSum
      })
    })

    // console.log(outMonthCount.value)
  })

  // 限额数据查询
  getPlan(dateFormater('YYYY-MM', nowDate.value)).then((res) => {
    plan.value = res
  })
}
// 判断是否超出限额
const outPlan = () => {
  const title = dayToMonth(nowDate.value)
  if (plan.value.limitMoney && outMonthCount.value[title] > plan.value.limitMoney) {
    return 'color:red'
  }
  return ''
}

initQuery()

let bookId = localStorage.getItem('bookId')
onMounted(() => {
  // 定时任务，用于在数据变更时自动刷新页面 TODO 待优化
  setInterval(() => {
    if (bookId != localStorage.getItem('bookId') || localStorage.getItem('changePlan') === 'true') {
      bookId = localStorage.getItem('bookId')
      initQuery()
      localStorage.setItem('changePlan', 'false')
    }
  }, 500)
})

watch(updatePlanFlag, () => {
  // 限额数据查询
  getPlan(dateFormater('YYYY-MM', nowDate.value)).then((res) => {
    plan.value = res
  })
})

const monthAnalysisDialog = ref(false)
const monthTitle = ref('')
const showMonthAnalysis = (month: string) => {
  monthAnalysisDialog.value = true
  monthTitle.value = month
}
</script>

<style>
.calendar-main {
  padding: 1rem;
  border-radius: 10px;
  border: solid 1px var(--el-menu-border-color);
}

.el-calendar-table .el-calendar-day {
  height: calc(var(--el-calendar-cell-width) * 1.5) !important;
}
.el-calendar-day {
  padding: 0 !important;
}

.day-container {
  height: 100%;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
}

.day-container span {
  border-radius: 0.5rem;
}

.day-container span:hover {
  background-color: rgba(100, 100, 100, 0.5);
}

.day-title {
  flex: 1;
  padding: 0.5rem;
}

.day-count {
  flex: 3;
  display: flex;
  flex-direction: column;
}

.day-count span {
  height: 1.5rem;
  display: flex;
  justify-content: center;
  padding: 0.2rem;
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

.no-flow,
.have-in {
  color: #2f8f00;
}

.no-in {
  color: var(--el-text-color-placeholder);
}

.el-calendar__body {
  padding: 0 1rem;
}

@media screen and (max-height: 860px) {
  .day-container span {
    margin: 0.1rem !important;
  }
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

  .v-btn {
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
