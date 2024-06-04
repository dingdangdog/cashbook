import $http from './index'

import type {OnlineSync} from '../types/model/online'

const prefix = '/admin/online';
/**
 * 数据上传
 */
export function upload(query: OnlineSync): Promise<any> {
  return $http({ url: prefix + "/upload", method: "post", data: query })
}
/**
 * 数据下载
 */
export function download(query: OnlineSync): Promise<any> {
  return $http({ url: prefix + "/download", method: "post", data: query })
}