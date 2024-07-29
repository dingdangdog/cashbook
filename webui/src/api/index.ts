/**
 * 封装http请求工具
 */
import { toLogin } from '@/utils/common'
import { ElMessage } from 'element-plus'
import type { Result } from '@/types/page'

// 创建api调用者
const api = async (functionName: string, ...args: any) => {
  // console.log(request)
  let serializedArgs = args.length > 0 ? args.map((arg: any) => JSON.stringify(arg)) : undefined
  console.log(functionName, serializedArgs)
  const res: Result<any> = await window.api.invokeHandler(functionName, serializedArgs)
  // console.log('res', res)
  if (!res) {
    ElMessage.error('res Undefined')
    throw Error('res undefined')
  }
  if (res.c == 500) {
    // 500 服务异常
    ElMessage.error(res.m)
    throw Error(res.m)
  } else if (res.c == 403) {
    localStorage.clear()
    // 403 登陆失效、无权限，跳转登陆页面
    ElMessage.error(`${res.m}-请重新登录-`)
    toLogin()
  } else {
    // 200 成功
    // 401 用户名密码错误
    return res.d
  }
}
export default api
