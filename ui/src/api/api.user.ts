
import $http from './index'
import type { User, LoginUser, NewPassword } from '../types/model/user'

/**
 * 登录
 * @returns Page<LoginUser>
 */
export function login(flag: boolean, user: User): Promise<LoginUser> {
  return $http({ url: "/login?flag=" + flag, method: "post", data: user })
}


/**
 * 注册
 * @returns Page<number>
 */
export function registerApi(user: User): Promise<number> {
  return $http({ url: "/register", method: "post", data: user })
}

/**
 * 校验密码
 * @returns Page<boolean>
 */
export function checkPassword(password: string): Promise<boolean> {
  return $http({ url: "/admin/checkPassword/" + password, method: "post" })
}

/**
 * 修改密码
 * @returns Page<boolean>
 */
export function changePassword(newPassword: NewPassword): Promise<boolean> {
  return $http({ url: "/admin/changePassword", method: "post", data: newPassword })
}


/**
 * 修改背景图片
 * @returns Page<boolean>
 */
export function setBackground(background: string): Promise<boolean> {
  return $http({ url: "/admin/setBackground?background=" + background, method: "get"})
}


export function checkUser(): Promise<{user:string,book:string}> {
  return $http({ url: "/admin/checkUser", method: "get" })
}


