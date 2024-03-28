import type { Typer } from '@/types/model/typer';
import $http from './index'

const prefix = '/admin';

/**
 * 流水类型
 */
export function getFlowType(): Promise<Typer[]> {
  return $http({ url: prefix + "/dict/getFlowType", method: "get" });
}

/**
 * 消费类型/收入类型
 * @param type
 */
export function getExpenseType(type: string): Promise<Typer[]> {
  return $http({ url: prefix + "/dict/getExpenseType/" + type, method: "get" });
}

/**
 * 支付方式
 * @param type
 */
export function getPaymentType(type: string): Promise<Typer[]> {
  return $http({ url: prefix + "/dict/getPaymentType/" + type, method: "get" });
}

export function getAll(typer: Typer): Promise<Typer[]> {
  return $http({ url: prefix + "/dict/getAll?type=" + typer.type + "&value=" + typer.value, method: "get" });
}

/**
 * 更新类型
 */
export function update(type: Typer): Promise<number> {
  return $http({ url: prefix + "/dict/update", method: "post", data: type });
}


/**
 * 获取类型关系
 */
export function getTypeRelation(): Promise<Record<string, string>> {
  return $http({ url: prefix + "/type/getTypeRelation", method: "get"});
}

/**
 * 更新类型关系
 */
export function updateTypeRelation(types: Record<string, string>): Promise<number> {
  return $http({ url: prefix + "/type/updateTypeRelation", method: "post", data: types});
}
