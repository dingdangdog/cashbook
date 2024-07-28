import api from './index'
import type { Book, CreateBookDto } from '@/types/model/book'

/**
 * 查询账本信息
 * @returns book
 */
export function getBook(userId: string, bookName: string | undefined): Promise<Book[]> {
  return api('queryBooks', { userId, bookName })
}

/**
 * 查询所有账本
 * @returns books
 */
export function getAllBook(): Promise<Book[]> {
  return api('readBooks')
}

/**
 * 注册账本
 * @returns result
 */
export function createBook(createDto: CreateBookDto): Promise<Book> {
  return api('addBook', createDto)
}

/**
 * 修改账本
 * @returns result
 */
export function updateBook(book: Book): Promise<Book> {
  return api('updateBook', book)
}
/**
 * 删除账本
 * @returns result
 */
export function deleteBook(id: number): Promise<Book> {
  return api('deleteBook', id)
}

/**
 * 修改账本密钥
 * @returns result
 */
// export async function openBookApi(): Promise<string> {
//   return api('deleteBook', id)
// }

export function checkBook(bookId: string | null): Promise<Book> {
  return api('checkBook', bookId)
}
