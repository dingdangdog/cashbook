import { MOD } from '@/stores/flag'
import $http from './index'
import local from './local'

import type { Plan } from '@/model/plan';

const prefix = '/admin/plans';

export function setPlans(plan: Plan, overwrite: number): Promise<any> {
  if (MOD.value === 'WEB') {
    return $http({ url: prefix + "/" + overwrite, method: "post", data: plan });
  } else {
    return local('addPlan', localStorage.getItem("bookId"), plan)
  }
}

export function getPlan(month: string): Promise<Plan> {
  if (MOD.value === 'WEB') {
    return $http({ url: prefix + "/" + month, method: "get" });
  } else {
    return local('getPlan', localStorage.getItem("bookId"), month)
  }
}
