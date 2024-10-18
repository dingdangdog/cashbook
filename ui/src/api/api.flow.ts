import { MOD } from '@/stores/flag'
import $http from './index'
import local from './local'

import type { Page } from '@/model/page'
import type { Flow, FlowQuery, CreateFlowDto, UpdateFlowDto } from '@/model/flow'

const prefix = '/admin/flow'

/**
 * 查询全部流水
 * @returns FlowPage
 */
export function getAll(query: FlowQuery): Promise<Flow[]> {
  if (MOD.value === 'WEB') {
    return $http({ url: prefix + '/getAll', method: 'get', params: query })
  } else {
    return local('getFlowList', localStorage.getItem('bookId'), query)
  }
}

/**
 * 查询流水分页
 * @returns Page<Flow>
 */
export function getFlowPage(query: FlowQuery): Promise<Page<Flow>> {
  if (MOD.value === 'WEB') {
    return $http({ url: prefix, method: 'get', params: query })
  } else {
    return local('queryFlowPage', localStorage.getItem('bookId'), query)
  }
}

/**
 * 新增流水
 * @returns Page<Flow>
 */
export function createFlow(createDto: CreateFlowDto): Promise<Flow> {
  if (MOD.value === 'WEB') {
    return $http({ url: prefix, method: 'post', data: createDto })
  } else {
    return local('addFlow', localStorage.getItem('bookId'), createDto)
  }
}

/**
 * 修改流水
 * @returns Page<Flow>
 */
export function update(id: string | number, updateDto: UpdateFlowDto): Promise<Flow> {
  if (MOD.value === 'WEB') {
    return $http({ url: prefix + '/' + id, method: 'put', data: updateDto })
  } else {
    return local('updateFlow', localStorage.getItem('bookId'), { id, ...updateDto })
  }
}

/**
 * 删除流水
 * @returns any
 */
export function deleteFlow(id: string | number): Promise<any> {
  if (MOD.value === 'WEB') {
    return $http({ url: prefix + '/' + id, method: 'delete' })
  } else {
    return local('deleteFlow', localStorage.getItem('bookId'), id)
  }
}

/**
 * 批量删除流水
 * @returns any
 */
export function deleteFlowsApi(ids: number[] | any): Promise<any> {
  if (MOD.value === 'WEB') {
    return $http({ url: prefix + '/deleteFlows', method: 'delete', data: { ids: ids } })
  } else {
    return local('deleteFlows', localStorage.getItem('bookId'), ids)
  }
}

/**
 * 批量导入流水
 * @param flows
 * @returns
 */
export function importFlows(importFlag: string, flows: Flow[]): Promise<any> {
  if (MOD.value === 'WEB') {
    return $http({
      url: prefix + '/importFlows?flag=' + importFlag,
      method: 'post',
      data: { flows: flows }
    })
  } else {
    return local('importFlows', localStorage.getItem('bookId'), importFlag, flows)
  }
}
