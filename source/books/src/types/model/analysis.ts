export interface DailyLineChartQuery {
  bookId?: number;
  flowType?: string;
  startDay?: string;
  endDay?: string;
}

export interface DailyLineChart {
  day: string;
  daySum: number;
  inSum: number;
}

export interface TypePieChartQuery {
  bookId?: number;
  flowType: string;
  startDay?: string;
  endDay?: string;
}

export interface TypePieChart {
  type: string;
  typeSum: number;
}