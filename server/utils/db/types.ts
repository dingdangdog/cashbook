/** 分页参数 */
export interface PaginationParams {
  pageNum?: number;
  pageSize?: number;
}

/** 分页结果 */
export interface PaginationResult<T> {
  total: number;
  data: T[];
  pages: number;
  pageNum: number;
  pageSize: number;
}

/** 构建分页 skip/take */
export function buildPagination(params: PaginationParams) {
  const pageNum = Math.max(1, params.pageNum ?? 1);
  const pageSize = params.pageSize ?? 15;
  const skip = (pageNum - 1) * pageSize;
  return { skip, take: pageSize, pageNum, pageSize };
}

/** 计算总页数 */
export function calcTotalPages(total: number, pageSize: number) {
  return pageSize > 0 ? Math.ceil(total / pageSize) : 1;
}
