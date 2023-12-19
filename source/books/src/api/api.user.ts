
import $http from './index'
import type { User, LoginUser } from '../types/model/user';

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
