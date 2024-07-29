import type { Flow } from "./flow";

export interface DailyLineChartQuery {
  bookId?: string;
  flowType?: string;
  startDay?: string;
  endDay?: string;
}

export interface DailyLineChart {
  day: string;
  daySum: number;
  inSum: number;
  zeroSum: number;
}

export interface TypePieChartQuery {
  bookId?: string;
  flowType?: string;
  startDay?: string;
  endDay?: string;
}

export interface TypePieChart {
  type: string;
  typeSum: number;
  inSum: number;
  zeroSum: number;
}

export interface MonthAnalysis {
  month: string;
  outSum: string;      // 总支出
  inSum: string;       // 总收入
  zeroSum: string;     // 总不计收支
  maxType: string;     // 最大支出类型
  maxTypeSum: string;  // 最大支出金额
  maxOut: Flow;        // 最大单笔支出
  maxIn: Flow;         // 最大单笔收入
}

