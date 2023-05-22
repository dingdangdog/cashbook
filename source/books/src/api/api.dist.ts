import type { Dist, DistQuery, CreateDistDto, UpdateDistDto } from '@/types/model/dist';
import type { Page } from '../types/page';
import $http from './index'

const prefix = '/admin/dist';

export function getDistByType(type: string): Promise<Dist[]> {
  return $http({ url: prefix + "/" + type, method: "get" });
}

/**
 * 查询字典分页
 * @returns Page<Dist>
 */
export function getDistPage(query: DistQuery): Promise<Page<Dist>> {
  return $http({ url: prefix, method: "get", params: query })
}


/**
* 新增字典
* @returns Page<Dist>
*/
export function addDist(createDto: CreateDistDto): Promise<Dist> {
  return $http({ url: prefix, method: "post", data: createDto })
}


/**
* 修改字典
* @returns Page<Dist>
*/
export function update(id: number, updateDto: UpdateDistDto): Promise<Dist> {
  return $http({ url: prefix + "/" + id, method: "put", data: updateDto })
}


/**
* 删除字典
* @returns any
*/
export function deleteDist(id: number): Promise<any> {
  return $http({ url: prefix + "/" + id, method: "delete" })
}
