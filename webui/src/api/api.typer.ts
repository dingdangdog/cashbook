import type { Typer } from '@/types/model/typer';
import api from './index'

const prefix = '/admin';

/**
 * 流水类型
 */
export function getFlowType(): Promise<Typer[]> {
  return api('getFlowType', localStorage.getItem("bookId"))
}

/**
 * 消费类型/收入类型
 * @param type
 */
export function getExpenseType(type: string): Promise<Typer[]> {
  return api('getExpenseType', localStorage.getItem("bookId"), type)
}

/**
 * 支付方式
 * @param type
 */
export function getPaymentType(type: string): Promise<Typer[]> {
  return api('getPaymentType', localStorage.getItem("bookId"), type)
}

export function getAll(typer: Typer): Promise<Typer[]> {
  // TODO
  // return $http({ url: prefix + "/dict/getAll?type=" + typer.type + "&value=" + typer.value, method: "get" });
  return api('getPaymentType', localStorage.getItem("bookId"), typer)
}

/**
 * 更新类型
 */
export function update(type: Typer): Promise<number> {
  return api('updateType', localStorage.getItem("bookId"), type)
}


/**
 * 获取类型关系
 */
export function getTypeRelation(): Promise<Record<string, string>> {
  return api('getTypeRelation', localStorage.getItem("bookId"))
}

/**
 * 更新类型关系
 */
export function updateTypeRelation(types: Record<string, string>): Promise<number> {
  // TODO
  // return $http({ url: prefix + "/type/updateTypeRelation", method: "post", data: types});
  return api('getTypeRelation', localStorage.getItem("bookId"))
}
