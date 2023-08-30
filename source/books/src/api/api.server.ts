import $http from './index'
import type { Server, Captcha } from '../types/model/server';

const prefix = '/server';

/**
 * 查询服务信息
 * @return Server
 */
export function getServerInfo(): Promise<Server> {
    return $http({ url: prefix, method: "get" })
}

/**
 * 获取验证码地址
 * @return Captcha
 */
export function getCaptcha(): Promise<Captcha> {
    return $http({ url: "/captcha", method: "get" })
}
