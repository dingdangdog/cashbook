import $http from './index'
import type { Book, CreateBookDto } from '../types/model/book';

const prefix = '/book';

/**
 * 查询用户信息
 * @returns User
 */
export function getBook(bookKey: string, captchaValue: string, captchaKey: string): Promise<Book> {
  return $http({ url: prefix + "/" + bookKey + "?captcha_id=" + captchaKey + "&captcha_value="+captchaValue, method: "get"})
}


/**
* 注册账本
* @returns User
*/
export function createBook(createDto: CreateBookDto): Promise<Book> {
  return $http({ url: prefix, method: "post", data: createDto })
}

/**
* 修改账本密钥
* @returns User
*/
export function changeKey(book: Book): Promise<Book> {
  return $http({ url: '/admin' + prefix + '/changeKey', method: "post", data: book })
}
