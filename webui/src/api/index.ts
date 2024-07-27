/**
 * 封装http请求工具
 */
import { toLogin } from '@/utils/common'
import { ElMessage } from 'element-plus'
import type { Result } from '@/types/page'

// 创建api调用者
const api = (functionName: string, ...args: any): any => {
  window.api.invokeHandler(functionName, ...args).then((res: Result<any>) => {
    if (res.c == 200) {
      return res.d
    } else if (res.c == 401) {
      toLogin()
    } else {
      ElMessage.error(res.m)
    }
  })
}
export default api
