/**
 * 封装http请求工具
 */
import axios from 'axios'

// 创建http调用者
const $http = axios.create({
  baseURL: '/api',
  timeout: 2000,
  headers: {
    'Content-Type': 'application/json;chartset=utf-8'
  }
})

// 请求拦截：为请求header中增加token
$http.interceptors.request.use(async (config) => {
  // baseURL/headers 属性可能不存在，若不存在设置默认值
  config.baseURL = config.baseURL || 'none'
  config.headers = config.headers || {}

  return config
})

// 响应拦截：解析响应结果，返回数据或捕获异常
$http.interceptors.response.use(
  (res) => {
    if (res.data.code != 200) {
      return Promise.reject(res.data)
      // return res.data
    }
    return res.data.data
  },
  (err) => {
    console.log(err)
    return
  }
)

export default $http
