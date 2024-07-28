import api from './index'
import type { User, LoginUser, NewPassword } from '../types/model/user'

/**
 * 登录
 * @returns Page<LoginUser>
 */
export function login(flag: boolean, user: User): Promise<LoginUser> {
  return api('login', flag, user)
}

/**
 * 注册
 * @returns Page<number>
 */
export function registerApi(user: User): Promise<number> {
  return api('register', user)
}

/**
 * 校验密码
 * @returns Page<boolean>
 */
export function checkPassword(password: string): Promise<boolean> {
  // TODO
  return api('checkPassword', {})
}

/**
 * 修改密码
 * @returns Page<boolean>
 */
export function changePassword(newPassword: NewPassword): Promise<boolean> {
  return api('changePassword', newPassword)
}

export function checkUser(userId: string | null): Promise<User> {
  return api('checkUser', userId)
}
