import $http from './index'
import type { Book, CreateBookDto } from '@/types/model/book';

const prefix = '/admin/book';

/**
 * 查询用户信息
 * @returns book
 */
export function getBook(name: string | undefined): Promise<Book[]> {
  return $http({ url: prefix + "?name=" + name, method: "get"})
}

/**
 * 查询所有账本
 * @returns books
 */
export function getAllBook(): Promise<Book[]> {
  return $http({ url: "allBook", method: "get"})
}



/**
* 注册账本
* @returns result
*/
export function createBook(createDto: CreateBookDto): Promise<Book> {
  return $http({ url: prefix, method: "post", data: createDto })
}

/**
 * 修改账本
 * @returns result
 */
export function updateBook(book: Book): Promise<Book> {
  return $http({ url: prefix + "/" + book.id, method: "put", data: book })
}
/**
 * 删除账本
 * @returns result
 */
export function deleteBook(id: number): Promise<Book> {
  return $http({ url: prefix + "/" + id, method: "delete" })
}


/**
* 修改账本密钥
* @returns result
*/
export function changeKey(book: Book): Promise<Book> {
  return $http({ url: prefix + '/changeKey', method: "post", data: book })
}

export async function openBookApi(): Promise<string> {
  return $http({ url: prefix + '/openBook', method: "post" })
}
