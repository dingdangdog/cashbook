export interface User {
  id?: string
  name?: string
  userName?: string
  password?: string
  againPassword?: string
}

export interface LoginParam {
  username?: string
  password?: string
}

export interface LoginUser {
  id?: string
  name?: string
  token?: string
  background?: string
}

export interface NewPassword {
  old: string
  new: string
}

export interface PageInfo<T> {
  current?: number
  pages?: number
  records?: T[]
  size?: number
  total?: number
}

export interface PageParam {
  pageNum?: number
  pageSize?: number
}

export interface SortParam {
  key?: string
  order?: string
}
