export interface Dist {
  id?: number;
  type?: string;
  distKey?: string;
  distValue?: string;
  bookKey?: string;
  sort?: number;
}

/**
 * 添加字典
 */
export interface CreateDistDto {
  type?: string;
  distKey?: string;
  distValue?: string;
  sort?: number;
}


/**
* 修改字典
*/
export interface UpdateDistDto {
  type?: string;
  distKey?: string;
  distValue?: string;
  sort?: number;
}
export class DistQuery {
  pageNum: number = 1;
  pageSize: number = 10;
  id?: number;
  type?: string;
  distKey?: string;
  distValue?: string;
}
