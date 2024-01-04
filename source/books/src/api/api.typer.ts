import type { Typer } from '@/types/model/typer';
import $http from './index'

const prefix = '/admin/dict';

/**
 * 流水类型
 */
export function getFlowType(): Promise<Typer[]> {
  return $http({ url: prefix + "/getFlowType", method: "get" });
}

/**
 * 消费类型/收入类型
 * @param type
 */
export function getExpenseType(type: string): Promise<Typer[]> {
  return $http({ url: prefix + "/getExpenseType/" + type, method: "get" });
}

/**
 * 支付方式
 * @param type
 */
export function getPaymentType(type: string): Promise<Typer[]> {
  return $http({ url: prefix + "/getPaymentType/" + type, method: "get" });
}

export function getAll(typer: Typer): Promise<Typer[]> {
  return $http({ url: prefix + "/getAll?type=" + typer.type + "&value=" + typer.value, method: "get" });
}

/**
 * 更新类型
 */
export function update(type: Typer): Promise<Typer[]> {
  return $http({ url: prefix + "/update", method: "post", data: type });
}
