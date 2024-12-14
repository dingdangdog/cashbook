import { MOD } from '@/stores/flag'
import $http from './index'
import local from './local'

import type { Typer } from '@/model/typer'

const prefix = '/admin'

/**
 * 流水类型
 */
export function getFlowType(): Promise<Typer[]> {
  if (MOD.value === 'WEB') {
    return $http({ url: prefix + '/dict/getFlowType', method: 'get' })
  } else {
    return local('getFlowType', localStorage.getItem('bookId'))
  }
}

/**
 * 消费类型/收入类型
 * @param type
 */
export function getExpenseType(type: string): Promise<Typer[]> {
  if (MOD.value === 'WEB') {
    return $http({ url: prefix + '/dict/getExpenseType/' + type, method: 'get' })
  } else {
    return local('getExpenseType', localStorage.getItem('bookId'), type)
  }
}

/**
 * 支付方式
 * @param type
 */
export function getPaymentType(type: string): Promise<Typer[]> {
  if (MOD.value === 'WEB') {
    return $http({ url: prefix + '/dict/getPaymentType/' + type, method: 'get' })
  } else {
    return local('getPaymentType', localStorage.getItem('bookId'), type)
  }
}

export function getAll(typer: Typer): Promise<Typer[]> {
  if (MOD.value === 'WEB') {
    return $http({
      url: prefix + '/dict/getAll?type=' + typer.type + '&value=' + typer.value,
      method: 'get'
    })
  } else {
    return local('getAll', localStorage.getItem('bookId'), typer)
  }
}

/**
 * 更新类型
 */
export function update(type: Typer): Promise<number> {
  if (MOD.value === 'WEB') {
    return $http({ url: prefix + '/dict/update', method: 'post', data: type })
  } else {
    return local('updateType', localStorage.getItem('bookId'), type)
  }
}

/**
 * 获取类型关系
 */
export function getTypeRelation(): Promise<Record<string, string>> {
  if (MOD.value === 'WEB') {
    return $http({ url: prefix + '/type/getTypeRelation', method: 'get' })
  } else {
    return local('getTypeRelation', localStorage.getItem('bookId'))
  }
}

/**
 * 更新类型关系
 */
export function updateTypeRelation(types: Record<string, string>): Promise<number> {
  if (MOD.value === 'WEB') {
    return $http({ url: prefix + '/type/updateTypeRelation', method: 'post', data: types })
  } else {
    return local('saveTypeConvertConfig', localStorage.getItem('bookId'), types)
  }
}
