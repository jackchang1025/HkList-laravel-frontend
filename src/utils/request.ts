// 导入必要的依赖和工具函数
import { setLoginRole, setLoginState } from '@/utils/env.js'
import axios from 'axios'
import { ElMessage } from 'element-plus'
// @ts-ignore
import { getConfig } from './config'



// 创建 axios 实例，配置基础请求参数
const instance = axios.create({
  // 使用相对路径，这样请求会经过 Vite 代理
  baseURL: getConfig().apiBaseUrl,
  // 设置请求超时时间为无限
  timeout: Infinity,
  // 设置请求头
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

// 请求拦截器：在发送请求之前对请求配置进行处理
instance.interceptors.request.use((config) => {
  // 确保 data 和 params 对象存在
  if (!config.data) config.data = {}
  if (!config.params) config.params = {}
  
  // 如果 URL 中包含查询参数，将其解析并合并到 params 中
  if (config.url) {
    const urlParams = new URLSearchParams(config.url.split('?')[1])
    config.params = {
      ...config.params,
      ...Object.fromEntries(urlParams)
    }
  }

  return config
})

// 响应拦截器：处理响应数据和错误
instance.interceptors.response.use(
  // 成功响应处理：直接返回响应数据
  (response) => response?.data,
  // 错误响应处理
  (error) => {
    // 获取错误信息
    const message = error.response?.data?.message

    if (message) {
      // 处理不同类型的错误信息
      if (message === '用户未登陆') {
        // 登录过期处理
        ElMessage.error('登陆已过期, 请重新登陆!')
        setLoginState('0')
        setTimeout(() => (location.href = '/login'), 1000)
      } else if (message === 'Too Many Attempts.') {
        // 请求频率限制处理
        ElMessage.error('请求量过大! 请等待10分钟后重试!')
      } else if (message === '用户权限不足') {
        // 权限不足处理
        ElMessage.error('用户权限不足, 请联系管理员!')
        setLoginRole('user')
        setTimeout(() => (location.href = '/user'), 1000)
      } else {
        // 其他错误信息直接显示
        ElMessage.error(message)
      }
    } else {
      // 服务器异常处理
      ElMessage.error('服务器异常, 请稍后再试')
      console.log(error)
    }

    // 返回被拒绝的 Promise
    return Promise.reject(error.response.data)
  }
)

// 导出 axios 实例
export default instance
