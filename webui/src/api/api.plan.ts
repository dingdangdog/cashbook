import type { Plan } from '@/types/model/plan'
import api from './index'

export function setPlans(plan: Plan, overwrite: number): Promise<any> {
  return api('addPlan', localStorage.getItem("bookId"), plan)
}

export function getPlan(month: string): Promise<Plan> {
  return api('getPlan', localStorage.getItem("bookId"), month)
}
