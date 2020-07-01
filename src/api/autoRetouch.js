/* eslint-disable no-console */
import axios from 'axios'
const BASE_URL = 'http://10.20.200.250:18089'
const algoAxios = axios.create()
algoAxios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
algoAxios.defaults.withCredentials = false
algoAxios.defaults.baseURL = BASE_URL
algoAxios.interceptors.request.use(
  config => {
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 对响应数据进行处理
algoAxios.interceptors.response.use(
  response => {
    let res = null
    res = response.data
    if (res.success) return res.msg
    return ''
  },
  error => {
    return Promise.reject(error)
  }
)

/**
 * @description 获取裁剪图
 * @param {*} params
 */
export function getAutoCropPic (params) {
  return algoAxios({
    url: '/algo/id/get_crop/',
    method: 'POST',
    data: params
  }).then(msg => {
    return msg
  })
}

/**
 * @description 获取调整图
 * @param {*} params
 */
export function getAutoAdjuctPic (params) {
  return algoAxios({
    url: '/algo/id/get_adjust/',
    method: 'POST',
    data: params
  }).then(msg => {
    return msg
  })
}

/**
 * @description 获取瘦脸图
 * @param {*} params
 */
export function getAutoChubbyPic (params) {
  return algoAxios({
    url: '/algo/id/get_chubby/',
    method: 'POST',
    data: params
  }).then(msg => {
    return msg
  })
}

/**
 * @description 眼睛
 * @param {*} params
 */
export function getAutoEyePic (params) {
  return algoAxios({
    url: '/algo/id/get_eye/',
    method: 'POST',
    data: params
  }).then(msg => {
    return msg
  })
}

/**
 * @description 微笑
 * @param {*} params
 */
export function getAutoSmilePic (params) {
  return algoAxios({
    url: '/algo/id/get_smile/',
    method: 'POST',
    data: params
  }).then(msg => {
    return msg
  })
}
export const algoUrl = BASE_URL

