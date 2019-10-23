'use strict'

import Vue from 'vue'
import axios from 'axios'
import router from '@/router/index.js'
import { Message } from 'element-ui'
import { errorCode } from './errorCode'

// axios 配置
axios.defaults.timeout = 10000
axios.defaults.retry = 4
axios.defaults.retryDelay = 500
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
axios.defaults.baseURL = process.env.VUE_APP_BASE_API
axios.defaults.withCredentials = true

console.log(axios.defaults.baseURL)

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
    let err = error.response
    console.log(err)  
    console.log(error)
    if (error === 'Network Error') {
      console.log('网络错误')
    }
    // if (err.data.error_code === 404) {
    //   router.push('/404')
    // }    
    return Promise.reject(error)
  }
)

export default axios
