export interface Page<T> {
  pageNum: number
  pageSize: number
  totalPage: number
  totalCount: number
  totalOut: number
  totalIn: number
  notInOut: number
  pageData: T[]
}

export interface Result<T> {
  c: number
  m: string
  d: T
}
