export interface Flow {
    id?: number;
    day?: string;
    type?: string;
    bookId?: number;
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
    bookId?: number;
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
    bookId?: number;
    type?: string;
    payType?: string;
    money?: number;
    name?: string;
    description?: string;
}

export class FlowQuery {
    pageNum: number = 1;
    pageSize: number = 20;
    id?: number;
    bookId?: number;
    startDay?: string;
    endDay?: string;
    type?: string;
    payType?: string;
    name?: string;
    description?: string;
    moneySort?: string;
}
