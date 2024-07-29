export interface Book {
  id: string;
  userId: string;
  bookName: string;
  createDate: string;
}

export class BookQuery {
  id?: string;
  userId?: string;
  bookName?: string;
  createDate?: string;
}
/**
* 创建流水的传输实体
*/
export interface CreateBookDto {
  bookName: string;
}
