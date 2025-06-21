<template>
  <div class="calendar-container">
    <div class="calendar-main">
      <v-calendar
        ref="calendar"
        :month="nowMonth"
        :year="nowYear"
        :events="events"
        class="calendar-grid"
      >
        <!-- 日历头部插槽，自定义日历头部显示内容 -->
        <template v-slot:header>
          <div class="calendar-header">
            <!-- Summary Section -->
            <div class="calendar-summary">
              <v-card class="summary-card" variant="flat">
                <v-card-text class="summary-content">
                  <div
                    class="summary-item income"
                    @click="clickDay('', '收入')"
                  >
                    <div class="summary-icon">
                      <v-icon
                        icon="mdi-cash-plus"
                        color="success"
                        size="large"
                      ></v-icon>
                    </div>
                    <div class="summary-data">
                      <div class="summary-label">总收入</div>
                      <div class="summary-value success--text">
                        {{ getInMonth() }}
                      </div>
                    </div>
                  </div>

                  <v-divider vertical></v-divider>

                  <div
                    class="summary-item expense"
                    @click="clickDay('', '支出')"
                  >
                    <div class="summary-icon">
                      <v-icon
                        icon="mdi-cash-minus"
                        color="error"
                        size="large"
                      ></v-icon>
                    </div>
                    <div class="summary-data">
                      <div class="summary-label">总支出</div>
                      <div class="summary-value error--text">
                        {{ getOutMonth() }}
                      </div>
                    </div>
                  </div>

                  <v-divider vertical></v-divider>

                  <div class="summary-item balance">
                    <div class="summary-icon">
                      <v-icon
                        icon="mdi-scale-balance"
                        :color="
                          getInMonth() - getOutMonth() >= 0 ? 'info' : 'warning'
                        "
                        size="large"
                      ></v-icon>
                    </div>
                    <div class="summary-data">
                      <div class="summary-label">结余</div>
                      <div
                        class="summary-value"
                        :class="
                          getInMonth() - getOutMonth() >= 0
                            ? 'info--text'
                            : 'warning--text'
                        "
                      >
                        {{ (getInMonth() - getOutMonth()).toFixed(2) }}
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </div>

            <!-- Actions Section -->
            <div class="calendar-actions">
              <v-btn
                color="primary"
                variant="elevated"
                prepend-icon="mdi-chart-box"
                @click="showMonthAnalysis(dayToMonth(nowDate))"
                class="analysis-button"
                rounded="pill"
                elevation="2"
              >
                当月分析
              </v-btn>
            </div>

            <!-- Navigation Section -->
            <div class="calendar-navigation">
              <v-btn
                icon="mdi-chevron-left"
                variant="text"
                @click="changeDate('prev-month')"
                class="nav-button"
                size="small"
              ></v-btn>

              <div class="calendar-month-title">
                {{ dayToMonth(nowDate) }}
              </div>

              <v-btn
                icon="mdi-chevron-right"
                variant="text"
                @click="changeDate('next-month')"
                class="nav-button"
                size="small"
              ></v-btn>
            </div>
          </div>
        </template>

        <!-- 日历事件插槽，用于显示自定义事件，时间可以跨天，利用该功能间接实现每天流水显示 -->
        <template v-slot:event="{ day, event }">
          <div class="calendar-event">
            <!-- Add Flow Button -->
            <div class="add-flow-button" v-if="event.type == 'button'">
              <v-btn
                size="x-small"
                color="primary"
                icon="mdi-plus"
                variant="flat"
                elevation="2"
                @click="addFlow(day)"
              ></v-btn>
            </div>

            <!-- Flow Data Display -->
            <div class="calendar-event-content" v-if="event.type == 'data'">
              <v-chip
                class="calendar-event-chip cursor-pointer"
                :class="
                  event.out
                    ? outMoneyClass(event.money)
                    : inMoneyClass(event.money)
                "
                variant="flat"
                @click="clickDay(event.day, String(event.title))"
                :prepend-icon="
                  event.out ? 'mdi-arrow-up-bold' : 'mdi-arrow-down-bold'
                "
              >
                {{ event.title }}: {{ Number(event.money).toFixed(2) }}
              </v-chip>
            </div>
          </div>
        </template>
      </v-calendar>
    </div>
    <!-- 月度交易分析弹窗 -->
    <v-dialog
      :width="'40rem'"
      v-model="monthAnalysisDialog"
      transition="dialog-bottom-transition"
      class="analysis-dialog"
    >
      <v-card>
        <v-card-title class="analysis-title">
          <v-icon icon="mdi-chart-box" class="mr-2"></v-icon>
          {{ monthTitle + " 流水分析" }}
        </v-card-title>
        <v-card-text>
          <DatasMonthAnalysis :data="monthAnalysisData" />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="tonal"
            prepend-icon="mdi-close-circle"
            @click="monthAnalysisDialog = false"
          >
            关闭
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 流水表格弹窗 -->
    <v-dialog
      :width="'80vw'"
      v-model="showFlowTable"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-card-title>
          <div class="flex justify-end">
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

    <!-- 添加流水弹窗 -->
    <FlowEditDialog
      v-if="showFlowEditDialog"
      title="添加流水"
      :flow="addFlowItem"
      :success-callback="addFlowSuccess"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "public",
  middleware: ["auth"],
});
import FlowEditDialog from "~/components/dialog/FlowEditDialog.vue";

import { VCalendar } from "vuetify/labs/VCalendar";
import { showFlowEditDialog } from "~/utils/flag";
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
  initDailyButton();
};

// 初始化日历按钮(新增流水按钮)
const initDailyButton = () => {
  const daysInMonth = new Date(nowYear.value, nowMonth.value, 0).getDate();
  // console.log(nowYear.value, nowMonth.value, daysInMonth);
  // Add event for the full month
  for (let day = 1; day <= daysInMonth; day++) {
    const buttonTitle = `button-${nowYear.value}-${nowMonth.value}-${day}`;
    const existingEvent = events.find((e) => e.title === buttonTitle);
    if (existingEvent) {
      console.log(buttonTitle);
      return;
    } else {
      events.unshift({
        type: "button",
        title: buttonTitle,
        day: `${nowYear.value}-${nowMonth.value + 1}-${day}`,
        start: new Date(`${nowYear.value}-${nowMonth.value + 1}-${day}`),
        end: new Date(`${nowYear.value}-${nowMonth.value + 1}-${day}`),
        color: "",
        allDay: true,
        out: false,
        money: 0,
      });
    }
  }
};

// 根据日期获取月份
const dayToMonth = (day: string | Date) => {
  let date = new Date(day);
  let year = date.getFullYear().toString();
  let month = (date.getMonth() + 1).toString();
  return year + " 年 " + month + " 月";
};

// 支出金额样式
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

// 收入金额样式
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
  type: string; // data表示流水数据，button表示按钮
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
    initDailyButton();
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

      // 收入
      inDayCount.value[data.type] = data.inSum;
      let inCount = inMonthCount.value[month] ? inMonthCount.value[month] : 0;
      inMonthCount.value[month] = inCount + Number(data.inSum);

      // 如果收入和支出都是0，则不显示
      if (Number(data.outSum) == 0 && Number(data.inSum) == 0) {
        return;
      }

      // 支出 chip
      events.push({
        type: "data",
        title: `支出`,
        day: data.type,
        start: new Date(data.type),
        end: new Date(data.type),
        color: "",
        allDay: true,
        out: true,
        money: data.outSum,
      });

      // 收入 chip
      events.push({
        type: "data",
        title: `收入`,
        day: data.type,
        start: new Date(data.type),
        end: new Date(data.type),
        color: "",
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
const monthAnalysisData = ref<MonthAnalysis>({
  month: "",
  outSum: "0",
  inSum: "0",
  zeroSum: "0",
  maxInType: "",
  maxInTypeSum: "0",
  maxOutType: "",
  maxOutTypeSum: "0",
  maxOut: {} as Flow,
  maxIn: {} as Flow,
  maxZero: {} as Flow,
});
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
  // console.log(monthParam);
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

const addFlowItem = ref<Flow | any>({});
const addFlow = (day: any) => {
  addFlowItem.value.day = day.isoDate;
  showFlowEditDialog.value = true;
  // console.log(day);
};
// 新增流水成功回调
const addFlowSuccess = (flow: Flow) => {
  const dayEvents = events.filter((e) => e.day === flow.day);

  if (flow.flowType === "不计收支") {
    return;
  }
  const isOutFlow = flow.flowType === "支出";
  const matchingEvent = dayEvents.find((e) => e.out === isOutFlow);

  // 更新月数据统计
  const month = dayToMonth(flow.day || "");
  if (isOutFlow) {
    outMonthCount.value[month] =
      Number(outMonthCount.value[month]) + Number(flow.money);
  } else {
    inMonthCount.value[month] =
      Number(inMonthCount.value[month]) + Number(flow.money);
  }

  // 更新日历 chip
  if (matchingEvent) {
    // Update existing event's money
    matchingEvent.money = Number(
      (Number(matchingEvent.money) + Number(flow.money)).toFixed(2)
    );
    matchingEvent.title = isOutFlow ? "支出" : "收入";
  } else {
    // Add new event
    events.push({
      start: new Date(flow.day || ""),
      end: new Date(flow.day || ""),
      allDay: true,
      out: isOutFlow,
      money: Number(flow.money),
      title: isOutFlow ? "支出" : "收入",
      type: "data",
      color: "",
      day: flow.day || "",
    });
  }
};
</script>

<style>
@import "~/assets/css/calendar.css";

/* Additional Calendar Styles */
.summary-card {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.03) !important;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
  overflow: hidden;
}

.summary-content {
  display: flex;
  justify-content: space-around;
  padding: 0.5rem !important;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.summary-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
  transform: translateY(-2px);
}

.summary-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.05);
}

.summary-data {
  display: flex;
  flex-direction: column;
}

.summary-label {
  font-size: 0.8rem;
  margin-bottom: 4px;
}

.summary-value {
  font-size: 0.7rem;
  font-weight: 600;
}

.success--text {
  color: #66bb6a !important;
}

.error--text {
  color: #ff5252 !important;
}

.info--text {
  color: #42a5f5 !important;
}

.warning--text {
  color: #ffa726 !important;
}

.nav-button {
  transition: transform 0.2s ease;
}

.nav-button:hover {
  transform: scale(1.2);
}

.analysis-button {
  transition: all 0.2s ease;
}

.analysis-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.calendar-event {
  position: relative;
}

.calendar-event-content {
  display: flex;
  justify-content: center;
  padding: 2px 0;
}

/* Dialog Enhancements */
.v-dialog > .v-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.v-card-title {
  font-size: 1.25rem;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(var(--v-border-color), 0.12);
  display: flex;
  align-items: center;
}

.v-card-text {
  padding: 20px;
}

.v-card-actions {
  padding: 12px 20px;
  border-top: 1px solid rgba(var(--v-border-color), 0.12);
}

/* Analysis Dialog */
.analysis-dialog .v-card {
  background-color: rgba(var(--v-theme-surface), 0.95);
}

.analysis-title {
  color: var(--v-theme-primary);
  font-weight: 600;
}

/* Flow Table Dialog */
.flow-table-dialog .v-card {
  max-height: 80vh;
}

.flow-table-title {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.flow-table-heading {
  font-weight: 600;
  color: var(--v-theme-primary);
}
</style>
