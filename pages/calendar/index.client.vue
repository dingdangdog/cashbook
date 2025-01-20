<template>
  <div class="calendar-container">
    <div class="calendar-main">
      <v-calendar
        ref="calendar"
        :month="nowMonth"
        :year="nowYear"
        :events="events"
      >
        <template v-slot:header="{ title }">
          <div
            style="
              display: flex;
              justify-content: space-between;
              margin-bottom: 0.5rem;
            "
          >
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
                :color="getOutMonth() > 0 ? 'error' : ''"
                @click="clickDay('', '支出')"
              >
                总支出：<b> {{ getOutMonth() }} </b> </v-chip
              >&nbsp;
              <!-- <v-chip :style="outPlan()" class="cursor-pointer">
                支出限额：<b>{{ plan.limitMoney }} </b>
              </v-chip> -->
            </div>
            <div
              style="
                flex: 1;
                display: flex;
                justify-content: space-between;
                align-items: center;
              "
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
              <v-btn
                color="primary"
                @click="showMonthAnalysis(dayToMonth(nowDate))"
              >
                当月分析
              </v-btn>
            </div>
          </div>
        </template>
        <template v-slot:event="{ day, allDay, event }">
          <p style="text-align: center; padding: 0.3rem 0.2rem">
            <v-chip
              class="cursor-pointer"
              :class="
                event.out
                  ? outMoneyClass(event.money)
                  : inMoneyClass(event.money)
              "
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
        <v-card-title>{{ monthTitle + " 流水分析" }}</v-card-title>
        <v-card-text>
          <DatasMonthAnalysis :data="monthAnalysisData" />
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="monthAnalysisDialog = false">
            关闭
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog :width="'80vw'" v-model="showFlowTable">
      <v-card>
        <v-card-title>
          <div class="tw-flex tw-justify-end">
            <div>
              <v-btn
                color="error"
                variant="elevated"
                @click="showFlowTable = false"
              >
                关闭
              </v-btn>
            </div>
          </div>
        </v-card-title>
        <v-card-text>
          <DatasFlowTable :query="query" v-if="showFlowTable" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "public",
  middleware: ["auth"],
});

import { VCalendar } from "vuetify/labs/VCalendar";

import { daily } from "~/utils/apis";
import { dateFormater } from "~/utils/common";
import type { CommonChartQuery } from "~/utils/model";

const doQuery = async (param: CommonChartQuery) => {
  return await daily(param);
};
// 支出相关数据存储实体
const outMonthCount = ref<any>({});
// key - 日期 value - 金额
const outDayCount = ref<any>({});
// 收入相关数据存储实体
const inMonthCount = ref<any>({});
// key - 日期 value - 金额
const inDayCount = ref<any>({});
const getInMonth = (): number => {
  const title = dayToMonth(nowDate.value);
  return Number(
    inMonthCount.value[title] ? Number(inMonthCount.value[title]).toFixed(2) : 0
  );
};
const getOutMonth = (): number => {
  const title = dayToMonth(nowDate.value);
  return Number(
    outMonthCount.value[title]
      ? Number(outMonthCount.value[title]).toFixed(2)
      : 0
  );
};

const query = ref<FlowQuery>({
  pageNum: 1,
  pageSize: 20,
});
const showFlowTable = ref(false);

// 日期点击事件
const clickDay = (day: string | any, flowType?: string) => {
  if (day == "") {
    query.value.startDay = dateFormater(
      "YYYY-MM-dd",
      new Date(nowDate.value.getFullYear(), nowDate.value.getMonth(), 1)
    );
    query.value.endDay = dateFormater(
      "YYYY-MM-dd",
      new Date(nowDate.value.getFullYear(), nowDate.value.getMonth() + 1, 0)
    );
  } else {
    query.value.startDay = day;
    query.value.endDay = day;
  }
  if (flowType) {
    query.value.flowType = flowType;
  } else {
    query.value.flowType = "";
  }
  showFlowTable.value = true;
};

const nowDate = ref(new Date());
const nowYear = ref(new Date().getFullYear());
const nowMonth = ref(new Date().getMonth());
const calendar = ref();

// 月份变更
const changeDate = (value: any) => {
  if (value == "prev-month") {
    nowDate.value.setMonth(nowDate.value.getMonth() - 1);
  } else if (value == "next-month") {
    nowDate.value.setMonth(nowDate.value.getMonth() + 1);
  } else {
    nowDate.value = new Date();
  }
  nowMonth.value = nowDate.value.getMonth();
  nowYear.value = nowDate.value.getFullYear();
};

// 根据日期获取月份
const dayToMonth = (day: string | Date) => {
  let date = new Date(day);
  let year = date.getFullYear().toString();
  let month = (date.getMonth() + 1).toString();
  return year + " 年 " + month + " 月";
};

const outMoneyClass = (money: any) => {
  if (!money || money == 0) {
    return "no-flow";
  } else if (money >= 1000) {
    return "thousand-flow";
  } else if (money >= 500) {
    return "five-hundred-flow";
  } else {
    return "have-flow";
  }
};
const inMoneyClass = (money: any) => {
  if (!money || money == 0) {
    return "no-in";
  } else {
    return "have-in";
  }
};
// 存储日历流水数据
const events = reactive<CalendarDate[]>([]);
interface CalendarDate {
  title: string;
  day: string;
  start: Date;
  end: Date;
  color: string;
  allDay: boolean;
  out: boolean;
  money: number;
}
// 初始化日历数据
const initQuery = () => {
  inMonthCount.value = {};
  inDayCount.value = {};
  outMonthCount.value = {};
  outDayCount.value = {};
  // 支出数据查询
  doQuery({}).then((res) => {
    if (res.length === 0) {
      Alert.error("暂无数据");
    }
    res.forEach((data) => {
      // 月集合
      let month = dayToMonth(data.type);
      // 支出
      outDayCount.value[data.type] = data.outSum;
      let count = outMonthCount.value[month] ? outMonthCount.value[month] : 0;
      outMonthCount.value[month] = count + Number(data.outSum);

      events.push({
        title: `支出`,
        day: data.type,
        start: new Date(data.type),
        end: new Date(data.type),
        color: "red",
        allDay: true,
        out: true,
        money: data.outSum,
      });

      // 收入
      inDayCount.value[data.type] = data.inSum;
      let inCount = inMonthCount.value[month] ? inMonthCount.value[month] : 0;
      inMonthCount.value[month] = inCount + Number(data.inSum);

      events.push({
        title: `收入`,
        day: data.type,
        start: new Date(data.type),
        end: new Date(data.type),
        color: "green",
        allDay: true,
        out: false,
        money: data.inSum,
      });
    });
  });
};

onMounted(() => {
  initQuery();
});

const monthAnalysisDialog = ref(false);
const monthTitle = ref("");
const monthAnalysisData = ref<MonthAnalysis>();
const showMonthAnalysis = (month: string) => {
  let monthParam = month
    .replace("年", "-")
    .replace("月", "")
    .replaceAll(" ", "");
  // 如果月份是单数，则补零
  monthTitle.value = month;
  if (monthParam.split("-")[1] && monthParam.split("-")[1].length === 1) {
    monthParam = monthParam.split("-")[0] + "-0" + monthParam.split("-")[1];
  }
  console.log(monthParam);
  doApi
    .post<MonthAnalysis>("api/entry/analytics/monthAnalysis", {
      month: monthParam,
      bookId: localStorage.getItem("bookId"),
    })
    .then((res) => {
      monthAnalysisData.value = res;
      monthAnalysisDialog.value = true;
    })
    .catch((err) => {
      // Alert.error("查询出错");
      console.log(err);
    });
};
</script>

<style>
.calendar-main {
  min-width: 55rem;
  padding: 1rem;
  border-radius: 10px;
  border: solid 1px var(--el-menu-border-color);
}

.thousand-flow {
  color: #d50000;
  font-weight: bold;
}
.five-hundred-flow {
  color: #6a1b9a;
  font-weight: bolder;
}
.have-flow {
  color: #f57c00;
}

.have-in {
  color: #2e7d32;
}
.no-flow,
.no-in {
  color: #d7ccc8;
}
</style>
