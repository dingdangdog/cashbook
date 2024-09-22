/**
 * 封装http请求工具
 */
import type { Result } from '@/model/page'
import { errorAlert } from '@/utils/alert'
import { cleanLoginInfo } from '@/utils/common'

// 创建api调用者
const local = async (functionName: string, ...args: any) => {
  // console.log(request)
  let serializedArgs = args.length > 0 ? args.map((arg: any) => JSON.stringify(arg)) : undefined
  // console.log(functionName, serializedArgs)
  // @ts-ignore
  const res: Result<any> = await window.api.invokeHandler(functionName, serializedArgs)
  // console.log('res', res)
  if (!res) {
    errorAlert('res Undefined')
    throw Error('res undefined')
  }
  if (res.c == 500) {
    // 500 服务异常
    errorAlert(res.m)
    throw Error(res.m)
  } else if (res.c == 403) {
    localStorage.clear()
    // 403 登陆失效、无权限，跳转登陆页面
    errorAlert(`${res.m}-请重新登录-`)
    cleanLoginInfo()
  } else {
    // 200 成功
    // 401 用户名密码错误
    return res.d
  }
}
export default local
