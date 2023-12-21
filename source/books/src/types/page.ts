
export interface Page<T>{
    pageNum: number;
    pageSize: number;
    totalPage: number;
    totalCount: number;
    totalOut: number;
    totalIn: number;
    pageData: T[];
}