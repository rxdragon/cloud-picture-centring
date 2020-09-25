/* eslint-disable no-console */
import axios from 'axios'
import ApiError from '../plugins/ApiError'
import * as PhotoTool from '@/utils/photoTool'
import * as AutoLog from '@/views/retoucher-center/autoLog'

const autoAxios = axios.create()
autoAxios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
autoAxios.defaults.withCredentials = false
autoAxios.interceptors.request.use(
  config => {
    return config
  },
  error => {
    return Promise.reject(error)
  }
)
autoAxios.interceptors.response.use(
  response => {
    let res = null
    res = response.data
    return res
  },
  error => {
    return Promise.reject(new ApiError(error))
  }
)

/**
 * @description 获取自动修图地址
 * @param {*} params 
 */
export async function getImageAutoProcess (params) {
  params = {
    ...params,
    flag: process.env.VUE_APP_ALGO_ENV === 'production' ? 'production' : 'dev'
  }
  const wrapPhotoPath = await hasAutoPhoto(params.url, 'warp')
  const cropPhotoPath = await hasAutoPhoto(params.url, 'crop')
  // 拦截监听
  if (wrapPhotoPath && cropPhotoPath) return {
    crop: cropPhotoPath,
    warp: wrapPhotoPath
  }

  return autoAxios({
    url: 'https://sc.algo.hzmantu.com/algo1/99/',
    method: 'POST',
    data: params
  }).then(msg => {
    const { result } = msg
    if (!result.crop) {
      AutoLog.handleEmpty(params.url, msg)
      return {
        crop: 'error',
        warp: 'error'
      }
    }
    return result
  }).catch(error => {
    AutoLog.autoErr(params.url, error)
  })
}

/**
 * @description 判断图片是否存在
 * @param {*} url 
 * @param {*} mode 
 */
function hasAutoPhoto (url, mode) {
  const algoDomain = process.env.VUE_APP_ALGO_DOMAIN
  const ext = PhotoTool.getFilePostfix(url)
  const name = url.replace(ext, '')
  const imageInfoPath = `${algoDomain}${name}_${mode}${ext}?imageInfo`
  return autoAxios({
    url: imageInfoPath,
    method: 'GET'
  }).then(msg => {
    return `${algoDomain}${name}_${mode}${ext}`
  }).catch(error => {
    return false
  })
}
