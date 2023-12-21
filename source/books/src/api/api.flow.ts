import $http from './index'
import type { Page } from '@/types/page';
import type { Flow, FlowQuery, CreateFlowDto, UpdateFlowDto } from '@/types/model/flow';

const prefix = '/admin/flow';

/**
 * 查询全部流水
 * @returns FlowPage
 */
export function getAll(query: FlowQuery): Promise<Flow[]> {
    return $http({ url: prefix + "/getAll", method: "get", params: query })
}

/**
 * 查询流水分页
 * @returns Page<Flow>
 */
export function getFlowPage(query: FlowQuery): Promise<Page<Flow>> {
    return $http({ url: prefix, method: "get", params: query })
}


/**
 * 新增流水
 * @returns Page<Flow>
 */
export function createFlow(createDto: CreateFlowDto): Promise<Flow> {
    return $http({ url: prefix, method: "post", data: createDto })
}


/**
 * 修改流水
 * @returns Page<Flow>
 */
export function update(id: number, updateDto: UpdateFlowDto): Promise<Flow> {
    return $http({ url: prefix + "/" + id, method: "put", data: updateDto })
}


/**
 * 删除流水
 * @returns Page<Flow>
 */
export function deleteFlow(id: number): Promise<any> {
    return $http({ url: prefix + "/" + id, method: "delete" })
}

/**
 * 批量导入流水
 * @param flows 
 * @returns 
 */
export function importFlows(importFlag: string, flows: Flow[]): Promise<any> {
    return $http({ url: prefix + "/importFlows?flag=" + importFlag, method: "post", data: { 'flows':flows }})
}