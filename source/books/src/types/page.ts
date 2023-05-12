
export interface Page<T>{
    pageNum: number;
    pageSize: number;
    totalPage: number;
    totalCount: number;
    totalMoney: number;
    pageData: T[];
}