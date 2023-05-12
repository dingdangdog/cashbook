import type { Dist } from '@/types/model/dist';
import $http from './index'

const prefix = '/dist';

export function getDistByType(type: string): Promise<Dist[]> {
  return $http({ url: prefix + "/" + type, method: "get" });
}
