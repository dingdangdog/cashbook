export interface SystemSetting {
  id: number;
  title: string;
  description: string;
  keywords: string;
  version: string;
  openRegister: boolean;
  createDate: Date;
  updateBy: Date;
}

// 用户表（与 Prisma users 表一致）
export interface User {
  id: number;
  username: string;
  password?: string;
  name?: string;
  email?: string | null;
  roles?: string | null;
  createAt: Date;
}

export interface Book {
  id: number;
  bookId: string;
  bookName: string;
  shareKey: string;
  userId: number;
  budget: number;
  createDate: Date;
}

export interface Flow {
  id?: number;
  userId?: number;
  bookId?: string;
  day?: string;
  flowType?: string; // 流水类型：收入、支出、不计收支
  industryType?: string; // 行业分类（支出类型/收入类型）
  payType?: string; // 支付方式/收款方式
  money?: number;
  name?: string;
  description?: string;
  invoice?: string;
  origin?: string; // 流水来源：谁谁-支付宝导入；谁谁手动输出
  attribution?: string; // 流水归属（谁的收入/支出）
  eliminate?: number; // 平账标志，0未平账；1已平账，-1忽略平账
}

// Budget 支出计划(预算)
export interface Budget {
  id?: number;
  userId?: number;
  bookId?: string;
  month?: string;
  budget?: number;
  used?: number;
}

// 待收款
export interface Receivable {
  id?: number;
  occurId?: number;
  actualId?: number;
  bookId?: string;
  userId?: number;
  name?: string;
  description?: string;
  occurDay?: string;
  expectDay?: string;
  actualDay?: string;
  money?: number;
  status?: number; // 状态：0未收款；1已收款；-1不要了；-2已放弃；-3不可抗力
}

export interface FixedFlow {
  id?: number;
  userId?: number;
  bookId?: string;
  startMonth?: string;
  endMonth?: string;
  month?: string;
  money?: number;
  name?: string;
  description?: string;
  flowType?: string; // 流水类型：收入、支出、不计收支
  industryType?: string; // 行业分类（支出类型/收入类型）
  payType?: string; // 支付方式/收款方式
  attribution?: string; // 流水归属（谁的收入/支出）
}

export interface TypeRelation {
  id: number;
  userId: number;
  bookId: string;
  source: string;
  target: string;
  bookName?: string; // 账本名称，用于显示
  bookDbId?: number; // 数据库内部ID，用于显示
}
