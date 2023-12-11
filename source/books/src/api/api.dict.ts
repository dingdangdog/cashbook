import type { Dict, DictQuery, CreateDictDto, UpdateDictDto } from '@/types/model/dict';
import type { Page } from '../types/page';
import $http from './index'

const prefix = '/admin/dict';

export function getDictByType(type: string): Promise<Dict[]> {
  return $http({ url: prefix + "/" + type, method: "get" });
}

/**
 * 查询字典分页
 * @returns Page<Dict>
 */
export function getDictPage(query: DictQuery): Promise<Page<Dict>> {
  return $http({ url: prefix, method: "get", params: query })
}


/**
* 新增字典
* @returns Page<Dict>
*/
export function addDict(createDto: CreateDictDto): Promise<Dict> {
  return $http({ url: prefix, method: "post", data: createDto })
}


/**
* 修改字典
* @returns Page<Dict>
*/
export function update(id: number, updateDto: UpdateDictDto): Promise<Dict> {
  return $http({ url: prefix + "/" + id, method: "put", data: updateDto })
}


/**
* 删除字典
* @returns any
*/
export function deleteDict(id: number): Promise<any> {
  return $http({ url: prefix + "/" + id, method: "delete" })
}
