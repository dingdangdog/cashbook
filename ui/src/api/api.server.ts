import $http from './index'
import type { Server } from '@/model/server'
import local from './local'
import { MOD } from '@/stores/flag'

const prefix = '/server'

/**
 * 查询服务信息
 * @return Server
 */
export function getServerInfo(): Promise<Server> {
  if (MOD.value === 'WEB') {
    return $http({ url: prefix, method: 'get' })
  } else {
    return local('getServerInfo')
  }
}

export function saveServerInfo(data: Server): Promise<any> {
  if (MOD.value === 'WEB') {
    return $http({ url: '/admin' + prefix, method: 'post', data })
  } else {
    return local('saveServerInfo', data)
  }
}
