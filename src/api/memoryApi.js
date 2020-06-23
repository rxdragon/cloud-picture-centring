/* eslint-disable no-console */
import axios from 'axios'
import { transformPercentage } from '@/utils/index.js'

const localAxios = axios.create()
localAxios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
localAxios.defaults.withCredentials = false
localAxios.interceptors.request.use(
  config => {
    return config
  },
  error => {
    return Promise.reject(error)
  }
)
localAxios.interceptors.response.use(
  response => {
    let res = response.data
    if (res.success) return res.msg
    return res
  },
  error => {
    return Promise.reject(error)
  }
)

/**
 * @description 修图师看到订单时间
 * @param {*} streamId
 */
export function getAllMemory () {
  return localAxios({
    url: 'http://localhost:3000/getAllMemory',
    method: 'GET'
  }).then(msg => {
    const { freeMemory, totalMemory } = msg
    const useMemory = totalMemory - freeMemory
    const memoryRatio = transformPercentage(useMemory, totalMemory)
    return { freeMemory, totalMemory, memoryRatio }
  })
}
