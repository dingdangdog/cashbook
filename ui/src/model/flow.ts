export interface Flow {
  id?: number | string
  day?: string
  flowType?: string // 流水类型
  type?: string // 消费类型
  bookId?: number
  payType?: string // 支付方式
  money?: number
  name?: string
  invoice?: string // 小票
  description?: string
}
/**
 * 创建流水的传输实体
 */
export interface CreateFlowDto {
  day?: string
  flowType?: string
  bookId?: number | string
  type?: string
  payType?: string
  money?: number
  name?: string
  description?: string
}

/**
 * 更新流水的传输实体
 */
export interface UpdateFlowDto {
  day?: string
  bookId?: number | string
  flowType?: string
  type?: string
  payType?: string
  money?: number
  name?: string
  description?: string
}

export class FlowQuery {
  pageNum?: number = 1
  pageSize?: number = 20
  id?: string | number
  bookId?: string | number
  startDay?: string
  endDay?: string
  flowType?: string
  type?: string
  payType?: string
  name?: string
  description?: string
  moneySort?: string
}
