export interface Dict {
  id?: number;
  type?: string;
  dictKey?: string;
  dictValue?: string;
  bookKey?: string;
  sort?: number;
}

/**
 * 添加字典
 */
export interface CreateDictDto {
  type?: string;
  dictKey?: string;
  dictValue?: string;
  sort?: number;
}


/**
* 修改字典
*/
export interface UpdateDictDto {
  type?: string;
  dictKey?: string;
  dictValue?: string;
  sort?: number;
}
export class DictQuery {
  pageNum: number = 1;
  pageSize: number = 20;
  id?: number;
  type?: string;
  dictKey?: string;
  dictValue?: string;
}
