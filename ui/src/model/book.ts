export interface Book {
  id?: number | string
  userId?: number | string
  bookName?: string
  createDate?: string
}

export class BookQuery {
  id?: number | string
  userId?: number | string
  bookName?: string
  createDate?: string
}
/**
 * 创建流水的传输实体
 */
export interface CreateBookDto {
  userId?: number | string
  bookName: string
}
