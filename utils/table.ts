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

// 用户表
export interface User {
  id: number;
  username: string;
  password: string;
  name?: string;
  email: string;
  createDate: Date;
}

export interface Book {
  id: number;
  bookId: string;
  bookName: string;
  shareKey: string;
  userId: number;
  createDate: Date;
}

export interface Flow {
  id: number;
  userId: number;
  bookId: string;
  day: string;
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

// Plan 支出计划
export interface Plan {
  id: number;
  bookId: string;
  month: string;
  limitMoney?: number;
  usedMoney?: number;
}

export interface TypeRelation {
  id: number;
  userId: number;
  bookId: string;
  source: string;
  target: string;
}
