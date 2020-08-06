'use strict'

import axios from 'axios'
import ApiError from './ApiError.js'
import { Message } from 'element-ui'
import { errorCode } from './errorCode'
import { readConfig } from "../utils/electronConfig"


// axios 配置
axios.defaults.timeout = 20000
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
axios.defaults.baseURL = readConfig('microApi') || process.env.VUE_APP_BASE_API
// 超时重新请求配置
axios.defaults.retry = 4
axios.defaults.retryDelay = 500

const whiteRequest = [
  'haveReworkStream',
  'getStreamQueueInfo',
  'getHaveCheckResult',
  'logStream',
  'getCacheCount',
  'incrCacheCount'
]

const noHandlerError = [
  0xA11006004
]

// 设置请求头信息
axios.interceptors.request.use(
  config => {
    let xstreamId = sessionStorage.getItem('xStreamId')
    if (xstreamId) {
      config.headers['x-stream-id'] = xstreamId
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 对响应数据进行处理
axios.interceptors.response.use(
  response => {
    let res = null
    res = response.data
    if (response.data.msg === 'login success') { res = response.headers['x-stream-id'] }
    if (res.success) return res.msg
    return res
  },
  error => {
    const requestPathArr = error.config.url.split('/')
    const requestPath = requestPathArr[requestPathArr.length - 1]
    const config = error.config
    // 如果config不存在或未设置重试选项，返回数据
    // 针对白名单处理
    if (whiteRequest.includes(requestPath)) {
      const message = '请求错误'
      // 设置变量
      config.__retryCount = config.__retryCount || 0
      // 检查最大重复此时
      if (config.__retryCount >= config.retry) {
        return Promise.reject(new ApiError(message))
      }
      config.__retryCount += 1 // 增加重试次数
       // 创建新的请求
      var backoff = new Promise(function (resolve) {
        setTimeout(function () {
          resolve()
        }, config.retryDelay || 1)
      })
      if (error.message.indexOf('timeout') !== -1) {
        return backoff.then(function () {
          return axios(config)
        })
      } else {
        return Promise.reject(new ApiError(message))
      }
    }
    // 普通的请求
    if (!error.response) {
      // 请求没有任何返回值：网络差，无服务
      const message = '网络错误，请稍后再试！'
      errorMessage(message)
      return Promise.reject(new ApiError(message))
    }
    
    // 请求成功 但是报错
    const data = error.response.data
    const noData = !data
    const serverError = data && (!data.error_code || (data.error_code !== 401 && data.error_code < 1000))
    // 系统繁忙错误
    const message = errorCode.getMsg(data)
    if (noData || serverError) {
      const message =  '系统繁忙，请稍后再试：' + data.error_msg
      errorMessage(message)
    } else if (!noHandlerError.includes(data.error_code)) {
      errorMessage(message)
    }
    return Promise.reject(new ApiError(message))
  }
)

function errorMessage (message) {
  return new Promise((resolve, reject) => {
    Message({
      type: 'error',
      message: message,
      duration: 1500,
      offset: 98,
      onClose: () => {
        resolve()
      }
    })
  })
}

export default axios
