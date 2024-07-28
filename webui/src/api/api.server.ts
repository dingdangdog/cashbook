import api from './index'
import type { Server } from '../types/model/server';

/**
 * 查询服务信息
 * @return Server
 */
export function getVersion(): Promise<Server> {
    return api('getVersion')
}
