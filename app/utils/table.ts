/** 系统设置（与 Prisma SystemConfig 表一致） */
export interface SystemSetting {
  id: number;
  title?: string | null;
  description?: string | null;
  keywords?: string | null;
  version?: string | null;
  openRegister: boolean;
  createAt: Date;
  updateAt: Date;
}

/** 用户表（与 Prisma User 一致） */
export interface User {
  id: number;
  username: string;
  password?: string;
  name?: string;
  email?: string | null;
  roles?: string | null;
  createAt: Date;
  /** 浅色主题编号 */
  lightTheme?: string | null;
  /** 深色主题编号 */
  darkTheme?: string | null;
}

/** 流水/交易记录（与 Prisma Flow 一致） */
export interface Flow {
  id?: number;
  /** 流水编号-唯一 */
  flowNo?: string;
  userId?: number;
  /** 交易日期（API 常用 string YYYY-MM-DD） */
  day?: string;
  flowType?: string; // 收入、支出、不计收支
  industryType?: string; // 行业/分类（支出类型或收入类型）
  payType?: string; // 支付方式/收款方式
  money?: number;
  name?: string;
  description?: string;
  invoice?: string; // 票据信息
  origin?: string; // 流水来源
  attribution?: string; // 流水归属
  eliminate?: number; // 0 未平账，1 已平账，-1 忽略平账
}

/** 预算/支出计划（与 Prisma Budget 一致） */
export interface Budget {
  id?: number;
  userId?: number;
  /** 月份 YYYY-MM */
  month?: string;
  budget?: number;
  used?: number;
}

/** 借出/应收款（与 Prisma Receivable 一致） */
export interface Receivable {
  id?: number;
  userId?: number;
  name?: string;
  description?: string | null;
  /** 借出日 */
  occurDay?: string;
  money?: number;
  /** 收款方式：0 一次性，1 分期-等额本息，2 分期-等额本金，3 分期-自定义 */
  planType?: number;
  interestRate?: number | null;
  termCount?: number | null;
  termAmount?: number | null;
  /** 0 未收清，1 已收清，-1 不要了，-2 已放弃，-3 不可抗力 */
  status?: number;
  /** 关联的借出流水 ID */
  occurFlowId?: number | null;
  /** 以下为 UI/计划表展示用，非主表字段 */
  expectDay?: string;
  actualDay?: string;
  occurId?: number;
  actualId?: number;
}

/** 固定流水/周期性流水模板（与 Prisma FixedFlow 一致） */
export interface FixedFlow {
  id?: number;
  userId?: number;
  /** 月份 YYYY-MM（模板可选） */
  month?: string;
  money?: number;
  name?: string;
  description?: string;
  flowType?: string;
  industryType?: string;
  payType?: string;
  attribution?: string;
  /** API 兼容：批量生成时用 */
  startMonth?: string;
  endMonth?: string;
}

/** 类型映射/关联（与 Prisma TypeRelation 一致） */
export interface TypeRelation {
  id: number;
  userId: number;
  source: string;
  target: string;
}
