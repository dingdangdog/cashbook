import $http from './index'
import type { Server } from '@/model/server'
import local from './local'

const prefix = '/server'

/**
 * 查询服务信息
 * @return Server
 */
export function getServerInfo(): Promise<Server> {
  return $http({ url: prefix, method: 'get' })
}

export function saveServerInfo(data: Server): Promise<any> {
  return $http({ url: '/admin' + prefix, method: 'post', data })
}
