/* eslint-disable no-console */
import axios from 'axios'
import ApiError from '../plugins/ApiError'
import { Message } from 'element-ui'

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
    if (!error.response) {
      // 请求没有任何返回值：网络差，无服务
      const message = '网络错误，请稍后再试！'
      errorMessage(message)
      return Promise.reject(new ApiError(message))
    }

  }
)

/**
 * @description 获取自动修图地址
 * @param {*} params 
 */
export async function getImageAutoProcess (params) {
  params = {
    ...params,
    flag: process.env.ENV === 'production' ? 'production' : 'dev'
  }
  const wrapPhotoPath = await hasAutoPhoto(params.url, 'warp')
  const cropPhotoPath = await hasAutoPhoto(params.url, 'crop')
  // 拦截监听
  if (wrapPhotoPath && cropPhotoPath) return {
    crop: cropPhotoPath,
    warp: wrapPhotoPath
  }

  return autoAxios({
    url: 'https://sc.algo.hzmantu.com/algo/199/',
    method: 'POST',
    data: params
  }).then(msg => {
    const { result } = msg
    if (!result.crop) {
      return {
        crop: 'error',
        warp: 'error'
      }
    }
    return result
  })
}

/**
 * @description 判断图片是否存在
 * @param {*} url 
 * @param {*} mode 
 */
function hasAutoPhoto (url, mode) {
  const algoDomain = process.env.VUE_APP_ALGO_DOMAIN
  url = `${algoDomain}${url}_${mode}?imageInfo`
  return autoAxios({
    url,
    method: 'GET'
  }).then(msg => {
    return `${algoDomain}${url}_${mode}`
  }).catch(error => {
    return false
  })
}


function errorMessage (message) {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line new-cap
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
