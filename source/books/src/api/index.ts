/**
 * 封装http请求工具
 */
import axios from 'axios'
import { toLogin } from '../utils/common'
import { ElMessage } from 'element-plus'

// 创建http调用者
const $http = axios.create({
    // 打包时把我放开！
    // baseURL: 'http://127.0.0.1:13303/api',
    // 开发时把我放开！
    baseURL: '/api',
    timeout: 2000,
    headers: {
        "Content-Type": "application/json;chartset=utf-8"
    }
})

// 请求拦截：为请求header中增加token
$http.interceptors.request.use(async config => {

    const bookKey: any = localStorage.getItem('bookKey');
    const token: any = localStorage.getItem('token');

    if (!token && $http.getUri.toString().indexOf('admin') > 0) {
        await toLogin();
        return Promise.reject('请先登录');
    }

    // baseURL/headers 属性可能不存在，若不存在设置默认值
    config.baseURL = config.baseURL || 'none';
    config.headers = config.headers || {};

    if (bookKey) {
        config.headers.bookKey = bookKey || 'none';
    }
    return config;
})

// 响应拦截：解析响应结果，返回数据或捕获异常
$http.interceptors.response.use(res => {

    if (res.data.code != 200) {
        ElMessage.error("接口异常");
        return Promise.reject(res.data);
        // return res.data
    }
    return res.data.data
}, err => {
    console.log(err);
})

export default $http;