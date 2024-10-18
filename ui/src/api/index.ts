/**
 * 封装http请求工具
 */
import axios from 'axios'
import { errorAlert } from '@/utils/alert'
import { cleanLoginInfo } from '@/utils/common'

// 创建http调用者
const $http = axios.create({
  baseURL: '/api',
  timeout: 6000,
  headers: {
    'Content-Type': 'application/json;chartset=utf-8'
  }
})

// 请求拦截：为请求header中增加token
$http.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('token')
  const bookId = localStorage.getItem('bookId')

  if (!token && $http.getUri.toString().indexOf('admin') > 0) {
    errorAlert('请先登录')
    return Promise.reject('请先登录')
  }

  // baseURL/headers 属性可能不存在，若不存在设置默认值
  config.baseURL = config.baseURL || 'none'
  config.headers = config.headers || {}

  config.headers['bookId'] = bookId || 0
  if (token) {
    config.headers.token = token
  }
  return config
})

// 响应拦截：解析响应结果，返回数据或捕获异常
$http.interceptors.response.use(
  (res) => {
    if (res.request.responseType === 'blob') {
      return res
    }
    if (res.data.c != 200) {
      errorAlert(res.data.m)
      return Promise.reject(res.data)
      // return res.data
    }
    return res.data.d
  },
  (err) => {
    if (err.response.status === 401) {
      cleanLoginInfo()
      return Promise.reject('请先登录')
    } else if (err.response.status === 500) {
      errorAlert('接口异常，请联系管理员！')
      return
    }
    errorAlert('未知错误！')
    console.log(err)
  }
)

export default $http
