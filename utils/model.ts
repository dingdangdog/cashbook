// 统一最外层包装类
export interface Result<T> {
  c: number;
  d: T;
  m?: string;
}

export interface Page<T> {
  pageNum: number;
  pageSize: number;
  pages: number;
  total: number;
  totalOut: number;
  totalIn: number;
  notInOut: number;
  data: T[];
}

// 分页查询参数
export interface PageParam {
  pageNum: number;
  pageSize: number;
}
export interface UserInfo {
  id: number;
  name: string;
  username: string;
  defaultFlowType?: string;
  createDate: Date;
}

export interface MonthAnalysis {
  month: string;
  outSum: string; // 总支出
  inSum: string; // 总收入
  zeroSum: string; // 总不计收支
  maxInType: string; // 最大收入类型
  maxInTypeSum: string; // 最大收入金额
  maxOutType: string; // 最大支出类型
  maxOutTypeSum: string; // 最大支出金额
  maxOut: Flow; // 最大单笔支出
  maxIn: Flow; // 最大单笔收入
  maxZero: Flow; // 最大单笔收入
}

/**
 * 创建流水的传输实体
 */
export interface CreateFlowDto {
  day?: string;
  flowType?: string;
  bookId?: number | string;
  type?: string;
  payType?: string;
  money?: number;
  name?: string;
  description?: string;
}

/**
 * 更新流水的传输实体
 */
export interface UpdateFlowDto {
  day?: string;
  bookId?: number | string;
  flowType?: string;
  type?: string;
  payType?: string;
  money?: number;
  name?: string;
  description?: string;
}

export class FlowQuery {
  pageNum?: number = 1;
  pageSize?: number = 20;
  id?: string | number;
  bookId?: string | number;
  startDay?: string;
  endDay?: string;
  flowType?: string;
  industryType?: string;
  payType?: string;
  name?: string;
  attribution?: string;
  description?: string;
  moneySort?: string;
}

export interface Server {
  version?: string;
  dataPath?: string;
  openRegister?: string;
}

export interface AdminLogin {
  account?: string;
  password?: string;
}

export interface CommonChartQuery {
  bookId?: string;
  flowType?: string;
  startDay?: string;
  endDay?: string;
  groupBy?: string; // 新增：分组字段，用于通用接口
}
export interface CommonChartData {
  type: string; // 数据标记 key，可能是日期、年月、支出类型、收入类型等，视具体使用场景而定
  inSum: number; // 收入
  outSum: number; // 支出
  zeroSum: number; // 不计收支
}

export interface Typer {
  bookId?: string;
  flowType?: string;
  type?: string;
  value?: string;
  oldValue?: string;
}

export interface CommonSelectOption {
  title: string;
  value: string;
}
