export interface Book {
  id: number;
  userId: number;
  bookName: string;
  createDate: string;
}

export class BookQuery {
  id?: number;
  userId?: number;
  bookName?: string;
  createDate?: string;
}
/**
* 创建流水的传输实体
*/
export interface CreateBookDto {
  bookName: string;
}
