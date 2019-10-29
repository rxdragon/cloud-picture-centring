'use strict'

import Vue from 'vue'
import axios from 'axios'
import router from '@/router/index.js'
import { Message } from 'element-ui'
import store from '../store' // vuex
import { errorCode } from './errorCode'
import { readConfig } from "../utils/electronConfig"

// axios 配置
axios.defaults.timeout = 10000
axios.defaults.retry = 4
axios.defaults.retryDelay = 500
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
axios.defaults.baseURL = readConfig('microApi') || process.env.VUE_APP_BASE_API
axios.defaults.withCredentials = true

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
    // 请求没有任何返回值：网络差，无服务
    if (!error.response) {
      let message = '系统繁忙，请稍后再试！'
      let promiseMessage = errorMessage(message)
      return Promise.reject(message)
    }
    let data = error.response.data
    let noData = !data
    let serverError = data &&
      (!data.error_code || (data.error_code !== 401 && data.error_code < 1000))
    if (noData || serverError) {
      let message =  '系统繁忙，请稍后再试：' + data.error_msg
      let promiseMessage = errorMessage(message)
      return Promise.reject(message)
    }
    let message = errorCode.getMsg(data)
    let promiseMessage = errorMessage(message)
    return Promise.reject(message)
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
