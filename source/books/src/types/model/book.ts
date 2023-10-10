export interface Book {
  id: number;
  bookName: string;
  bookKey: string;
  createDate: string;
}

export class BookQuery {
  id?: number;
  bookName?: string;
  createDate?: string;
}
/**
* 创建流水的传输实体
*/
export interface CreateBookDto {
  bookName: string;
  bookKey: string;
}
