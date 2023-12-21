import type { Dict } from '@/types/model/dict';
import $http from './index'

const prefix = '/admin/dict';

/**
 * 流水类型
 */
export function getFlowType(): Promise<Dict[]> {
  return $http({ url: prefix + "/getFlowType", method: "get" });
}

/**
 * 消费类型/收入类型
 * @param type
 */
export function getExpenseType(type: string): Promise<Dict[]> {
  return $http({ url: prefix + "/getExpenseType/" + type, method: "get" });
}

/**
 * 支付方式
 * @param type
 */
export function getPaymentType(type: string): Promise<Dict[]> {
  return $http({ url: prefix + "/getPaymentType/" + type, method: "get" });
}

export function getDictByType(type: string): Promise<Dict[]> {
  return $http({ url: prefix + "/" + type, method: "get" });
}

/**
* 删除字典
* @returns any
*/
export function deleteDict(id: number): Promise<any> {
  return $http({ url: prefix + "/" + id, method: "delete" })
}
