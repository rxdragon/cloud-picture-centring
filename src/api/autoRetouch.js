/* eslint-disable no-console */
import axios from 'axios'
import * as CanvasTool from '@/utils/canvasTool'

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
    console.log(msg)
    const cropBlobData = CanvasTool.convertBase64ToBlob(msg.crop)
    const crop = URL.createObjectURL(cropBlobData)
    const warpBlobData = CanvasTool.convertBase64ToBlob(msg.warp)
    const warp = URL.createObjectURL(warpBlobData)
    return {
      crop,
      warp
    }
  })
}
