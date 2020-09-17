/* eslint-disable no-console */
import axios from 'axios'

/**
 * @description 获取自动修图地址
 * @param {*} params 
 */
export function getImageAutoProcess (params) {
  return axios({
    url: '/file_system/algo/imageAutoProcess',
    method: 'GET',
    params
  }).then(msg => {
    if (msg instanceof Array && !msg.length) {
      return {
        crop: 'error',
        warp: 'error'
      }
    }
    return msg
  })
}
