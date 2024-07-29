export interface Flow {
    id?: string;
    day?: string;
    // 流水类型
    flowType?: string;
    // 消费类型
    type?: string;
    bookId?: string;
    // 支付方式
    payType?: string;
    money?: number;
    name?: string;
    description?: string;
}
/**
 * 创建流水的传输实体
 */
export interface CreateFlowDto {
    day?: string;
    flowType?: string;
    bookId?: string;
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
    bookId?: string;
    flowType?: string;
    type?: string;
    payType?: string;
    money?: number;
    name?: string;
    description?: string;
}

export class FlowQuery {
    pageNum: number = 1;
    pageSize: number = 20;
    id?: string;
    bookId?: string;
    startDay?: string;
    endDay?: string;
    flowType?: string;
    type?: string;
    payType?: string;
    name?: string;
    description?: string;
    moneySort?: string;
}
