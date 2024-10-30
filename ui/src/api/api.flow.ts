import { MOD } from '@/stores/flag'
import $http from './index'
import local from './local'

import type { Page } from '@/model/page'
import type { Flow, FlowQuery, CreateFlowDto, UpdateFlowDto } from '@/model/flow'
import { generateMixed } from '@/utils/common'

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
    return local('deleteFlows', localStorage.getItem('bookId'), [id])
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

/**
 * 上传流水小票
 * @param form
 * @returns
 */
export function uploadInvoiceFileApi(form: FormData): Promise<any> {
  if (MOD.value === 'WEB') {
    return $http({
      url: prefix + '/uploadInvoice',
      method: 'post',
      headers: { 'Content-Type': 'multipart/form-data' },
      data: form
    })
  } else {
    const flowId = form.get('id')
    // @ts-ignore
    const file: File = form.get('invoice')
    console.log('invoice', file)
    return local(
      'uploadInvoice',
      localStorage.getItem('bookId'),
      flowId,
      flowId + generateMixed(8) + '.invoice',
      // @ts-ignore
      file.path
    )
  }
}

export function showInvoice(invoice: string): Promise<any> {
  if (MOD.value === 'WEB') {
    return $http({
      url: prefix + '/showInvoice?invoice=' + invoice,
      method: 'get',
      responseType: 'blob'
    })
  } else {
    return local('showInvoice', invoice)
  }
}

export function deleteInvoiceApi(id: any, invoice: string): Promise<any> {
  if (MOD.value === 'WEB') {
    return $http({
      url: prefix + '/deleteInvoice',
      method: 'post',
      data: {
        id,
        invoice
      }
    })
  } else {
    return local('deleteInvoice', localStorage.getItem('bookId'), id, invoice)
  }
}
