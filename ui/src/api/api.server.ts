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

/**
 * 查询服务信息
 * @return Server
 */
export function getVersion(): Promise<string> {
  return local('getVersion')
}
