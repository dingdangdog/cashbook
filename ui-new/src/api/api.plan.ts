import type { Plan } from '@/model/plan';
import $http from './index'

const prefix = '/admin/plans';

export function setPlans(plan: Plan, overwrite: number): Promise<any> {
  return $http({ url: prefix + "/" + overwrite, method: "post", data: plan });
}

export function getPlan(month: string): Promise<Plan> {
  return $http({ url: prefix + "/" + month, method: "get" });
}
