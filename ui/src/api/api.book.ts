import { MOD } from '@/stores/flag'
import $http from './index'
import local from './local'

import type { Book, CreateBookDto } from '@/model/book'

const prefix = '/admin/book'

/**
 * 查询用户信息
 * @returns book
 */
export function getBook(name: string | undefined): Promise<Book[]> {
  if (MOD.value === 'WEB') {
    return $http({ url: prefix + '?name=' + name, method: 'get' })
  } else {
    // console.log(localStorage.getItem('userId'), localStorage.getItem('bookId'))
    return local('queryBooks', { userId: localStorage.getItem('userId'), bookName: name })
  }
}

/**
 * 查询所有账本
 * @returns books
 */
export function getAllBook(): Promise<Book[]> {
  if (MOD.value === 'WEB') {
    return $http({ url: 'allBook', method: 'get' })
  } else {
    return local('readBooks')
  }
}

/**
 * 注册账本
 * @returns result
 */
export function createBook(createDto: CreateBookDto): Promise<Book> {
  if (MOD.value === 'WEB') {
    return $http({ url: prefix, method: 'post', data: createDto })
  } else {
    createDto.userId = localStorage.getItem('userId')
    return local('addBook', createDto)
  }
}

/**
 * 修改账本
 * @returns result
 */
export function updateBook(book: Book): Promise<Book> {
  if (MOD.value === 'WEB') {
    return $http({ url: prefix + '/' + book.id, method: 'put', data: book })
  } else {
    return local('updateBook', book)
  }
}
/**
 * 删除账本
 * @returns result
 */
export function deleteBook(id: number): Promise<Book> {
  if (MOD.value === 'WEB') {
    return $http({ url: prefix + '/' + id, method: 'delete' })
  } else {
    return local('deleteBook', id)
  }
}

export async function openBookApi(): Promise<string> {
  if (MOD.value === 'WEB') {
    return $http({ url: prefix + '/openBook', method: 'post' })
  } else {
    return new Promise((resolve, reject) => {
      resolve('账本已打开')
    })
  }
}
