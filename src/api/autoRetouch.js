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
  const hasWrapPhoto = await hasAutoPhoto(params.url, 'warp')
  const hasCropPhoto = await hasAutoPhoto(params.url, 'crop')
  // 拦截监听
  // TODO 增加水印地址
  if (hasWrapPhoto && hasCropPhoto) return {
    crop: 'error',
    warp: 'error'
  }

  return autoAxios({
    url: 'https://sc.algo.hzmantu.com/algo/199/',
    headers: {},
    method: 'POST',
    data: params
  }).then(msg => {
    const { result } = msg
    console.log(msg)
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
  url = `https://cloud-dev.cdn-qn.hzmantu.com/compress/2020/06/17/ljlYFjMmWelwE0Jc-Ts6m-OUJEV3.jpg?imageInfo`
  return autoAxios({
    url,
    method: 'GET'
  }).then(msg => {
    return true
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
