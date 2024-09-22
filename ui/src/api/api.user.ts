import { MOD } from '@/stores/flag'
import $http from './index'
import local from './local'

import type { User, LoginUser, NewPassword } from '@/model/user'

/**
 * 登录
 * @returns Page<LoginUser>
 */
export function login(flag: boolean, user: User): Promise<LoginUser> {
  if (MOD.value === 'WEB') {
    return $http({ url: '/login?flag=' + flag, method: 'post', data: user })
  } else {
    return local('login', flag, user)
  }
}

/**
 * 注册
 * @returns Page<number>
 */
export function registerApi(user: User): Promise<number> {
  if (MOD.value === 'WEB') {
    return $http({ url: '/register', method: 'post', data: user })
  } else {
    return local('register', user)
  }
}

/**
 * 校验密码
 * @returns Page<boolean>
 */
export function checkPassword(password: string): Promise<boolean> {
  if (MOD.value === 'WEB') {
    return $http({ url: '/admin/checkPassword/' + password, method: 'post' })
  } else {
    // TODO
    return local('checkPassword', {})
  }
}

/**
 * 重置密码
 * @param data
 * @returns
 */
export function resetPasswordApi(data: any): Promise<boolean> {
  if (MOD.value === 'WEB') {
    return $http({ url: '/resetPassword', method: 'post', data })
  } else {
    return local('resetPassword', localStorage.getItem('userId'), data)
  }
}

/**
 * 修改密码
 * @returns Page<boolean>
 */
export function changePassword(newPassword: NewPassword): Promise<boolean> {
  if (MOD.value === 'WEB') {
    return $http({ url: '/admin/changePassword', method: 'post', data: newPassword })
  } else {
    return local('changePassword', newPassword)
  }
}

export function checkUser(): Promise<{ user: string; book: string }> {
  if (MOD.value === 'WEB') {
    return $http({ url: '/admin/checkUser', method: 'get' })
  } else {
    return local('checkUser', localStorage.getItem('userId'))
  }
}
