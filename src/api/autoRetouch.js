/* eslint-disable max-len */
/* eslint-disable no-console */
import axios from 'axios'
import ApiError from '../plugins/ApiError'
import uuidv4 from 'uuid'

import MattingImage from '@/components/AutoRetouch/MattingImage'
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

// 修图操作
export const OPERATION_TYPE = {
  CROP: 'c', // 裁切
  WARP: 'w', // 液化
  RETOUCH: 'r', // 磨皮
  MATTING: 'm', // 抠图
}

// 操作中文
export const OperationName = {
  [OPERATION_TYPE.CROP]: 'C 智能裁剪',
  [OPERATION_TYPE.WARP]: 'R 智能磨皮',
  [OPERATION_TYPE.RETOUCH]: 'W 磨皮',
  [OPERATION_TYPE.MATTING]: 'M 抠图',
}

export const OperationBit = {
  [OPERATION_TYPE.CROP]: 0b1000,
  [OPERATION_TYPE.WARP]: 0b0100,
  [OPERATION_TYPE.RETOUCH]: 0b0010,
  [OPERATION_TYPE.MATTING]: 0b0001,
}

/**
 * @description 转换为缩略图
 * @param {@} url 
 */
export function changeToCompress (url) {
  if (url.includes('blob')) return url
  const postfix = PhotoTool.getFilePostfix(url)
  const compressUrl = url.replace(postfix,`_compress${postfix}`)
  return compressUrl
}

export class AutoRetouchModel {
  uuid = ''
  path = ''
  showPath = ''
  activate = false
  handleSwtich = {
    [OPERATION_TYPE.CROP]: true,
    [OPERATION_TYPE.WARP]: false,
    [OPERATION_TYPE.RETOUCH]: false,
    [OPERATION_TYPE.MATTING]: false,
  }
  autoFixPhotoList = {
    [OperationBit[OPERATION_TYPE.CROP]]: '',
    [OperationBit[OPERATION_TYPE.CROP] | OperationBit[OPERATION_TYPE.WARP]]: '',
    [OperationBit[OPERATION_TYPE.CROP] | OperationBit[OPERATION_TYPE.RETOUCH]]: '',
    [OperationBit[OPERATION_TYPE.CROP] | OperationBit[OPERATION_TYPE.MATTING]]: '',
    [OperationBit[OPERATION_TYPE.CROP] | OperationBit[OPERATION_TYPE.WARP] | OperationBit[OPERATION_TYPE.RETOUCH]]: '',
    [OperationBit[OPERATION_TYPE.CROP] | OperationBit[OPERATION_TYPE.WARP] | OperationBit[OPERATION_TYPE.MATTING]]: '',
    [OperationBit[OPERATION_TYPE.CROP] | OperationBit[OPERATION_TYPE.RETOUCH] | OperationBit[OPERATION_TYPE.MATTING]]: '',
    [OperationBit[OPERATION_TYPE.CROP] | OperationBit[OPERATION_TYPE.WARP] |OperationBit[OPERATION_TYPE.RETOUCH] | OperationBit[OPERATION_TYPE.MATTING]]: '',
  }

  cropMaskPhoto = ''
  cropWarpMaskPhoto = ''

  constructor (photoUrl) {
    this.uuid = uuidv4()
    this.path = photoUrl
  }

  // 获取自动修图列表
  async getAutoList () {
    const req = { url: this.path }
    const res = await getImageAutoProcess(req)
    // 获取模版照
    this.cropMaskPhoto = res[`${OPERATION_TYPE.CROP}${OPERATION_TYPE.MATTING}`]
    this.cropWarpMaskPhoto = res[`${OPERATION_TYPE.CROP}${OPERATION_TYPE.WARP}${OPERATION_TYPE.MATTING}`]

    const cBit = OperationBit[OPERATION_TYPE.CROP]
    this.autoFixPhotoList[cBit] = res[OPERATION_TYPE.CROP]
    const cwBit = OperationBit[OPERATION_TYPE.CROP] | OperationBit[OPERATION_TYPE.WARP]
    this.autoFixPhotoList[cwBit] = res[`${OPERATION_TYPE.CROP}${OPERATION_TYPE.WARP}`]
    const crBit = OperationBit[OPERATION_TYPE.CROP] | OperationBit[OPERATION_TYPE.RETOUCH]
    this.autoFixPhotoList[crBit] = res[`${OPERATION_TYPE.CROP}${OPERATION_TYPE.RETOUCH}`]
    const cwrBit = OperationBit[OPERATION_TYPE.CROP] | OperationBit[OPERATION_TYPE.WARP] | OperationBit[OPERATION_TYPE.RETOUCH]
    this.autoFixPhotoList[cwrBit] = res[`${OPERATION_TYPE.CROP}${OPERATION_TYPE.WARP}${OPERATION_TYPE.RETOUCH}`]
    
    // 抠图照片
    const cmBit = OperationBit[OPERATION_TYPE.CROP] | OperationBit[OPERATION_TYPE.MATTING]
    this.autoFixPhotoList[cmBit] = await this.drawMattingImage(this.cropMaskPhoto, this.autoFixPhotoList[cBit], true)
    const crmBit = OperationBit[OPERATION_TYPE.CROP] | OperationBit[OPERATION_TYPE.RETOUCH] | OperationBit[OPERATION_TYPE.MATTING]
    this.autoFixPhotoList[crmBit] = await this.drawMattingImage(this.cropMaskPhoto, this.autoFixPhotoList[crBit], true)

    const cwmBit = OperationBit[OPERATION_TYPE.CROP] | OperationBit[OPERATION_TYPE.WARP] | OperationBit[OPERATION_TYPE.MATTING]
    this.autoFixPhotoList[cwmBit] = await this.drawMattingImage(this.cropWarpMaskPhoto, this.autoFixPhotoList[cwBit], true)
    const cwrmBit = OperationBit[OPERATION_TYPE.CROP] | OperationBit[OPERATION_TYPE.WARP] |OperationBit[OPERATION_TYPE.RETOUCH] | OperationBit[OPERATION_TYPE.MATTING]
    this.autoFixPhotoList[cwrmBit] = await this.drawMattingImage(this.cropWarpMaskPhoto, this.autoFixPhotoList[cwrBit], true)
  }

  async drawMattingImage (maskPhoto, orgrinPhoto, compress) {
    const compressSize = 1000
    const MattingImageClass = new MattingImage(maskPhoto, orgrinPhoto)
    const orgrinPhotoDom = await MattingImageClass.readImageData(orgrinPhoto)

    const canvasHeight = compress ? compressSize : orgrinPhotoDom.naturalHeight
    const canvasWidth = compress ? compressSize : orgrinPhotoDom.naturalWidth
    
    const { canvas, context } = MattingImageClass.createCanvas(canvasWidth, canvasHeight)
    const mattingImage = await MattingImageClass.drawImage(canvas, context)
    // TODO mattingImage
    const compoundImage = await MattingImageClass.addBackground(canvas, context, mattingImage)
    return compoundImage
  }
}

/**
 * @description 获取自动修图地址
 * @param {*} params 
 */
export async function getImageAutoProcess (params) {
  params = {
    ...params,
    flag: process.env.VUE_APP_ALGO_ENV === 'production' ? 'production' : 'dev'
  }

  // TODO 调试
  // const res = await autoAxios({
  //   url: 'http://algo-dev.hzmantu.com/algo1/102/',
  //   method: 'POST',
  //   data: params
  // })
  const res = {
    code: 1,
    msg: "UploadRegulator cwm_compress successfully, result is: 	https://cloud-dev.cdn-qn.hzmantu.com/algo/2020/06/17/lkLb5AfrSqhmamZTsZ_XqzFDnSdv_cwm_compress.png",
    result: {
      c: "https://cloud-dev.cdn-qn.hzmantu.com/algo/2020/06/17/lkLb5AfrSqhmamZTsZ_XqzFDnSdv_c.jpg",
      c_compress: "https://cloud-dev.cdn-qn.hzmantu.com/algo/2020/06/17/lkLb5AfrSqhmamZTsZ_XqzFDnSdv_c_compress.jpg",
      cm: "https://cloud-dev.cdn-qn.hzmantu.com/algo/2020/06/17/lkLb5AfrSqhmamZTsZ_XqzFDnSdv_cm.png",
      cm_compress: "https://cloud-dev.cdn-qn.hzmantu.com/algo/2020/06/17/lkLb5AfrSqhmamZTsZ_XqzFDnSdv_cm_compress.png",
      cr: "https://cloud-dev.cdn-qn.hzmantu.com/algo/2020/06/17/lkLb5AfrSqhmamZTsZ_XqzFDnSdv_cr.jpg",
      cr_compress: "https://cloud-dev.cdn-qn.hzmantu.com/algo/2020/06/17/lkLb5AfrSqhmamZTsZ_XqzFDnSdv_cr_compress.jpg",
      cw: "https://cloud-dev.cdn-qn.hzmantu.com/algo/2020/06/17/lkLb5AfrSqhmamZTsZ_XqzFDnSdv_cw.jpg",
      cw_compress: "https://cloud-dev.cdn-qn.hzmantu.com/algo/2020/06/17/lkLb5AfrSqhmamZTsZ_XqzFDnSdv_cw_compress.jpg",
      cwm: "https://cloud-dev.cdn-qn.hzmantu.com/algo/2020/06/17/lkLb5AfrSqhmamZTsZ_XqzFDnSdv_cwm.png",
      cwm_compress: "https://cloud-dev.cdn-qn.hzmantu.com/algo/2020/06/17/lkLb5AfrSqhmamZTsZ_XqzFDnSdv_cwm_compress.png",
      cwr: "https://cloud-dev.cdn-qn.hzmantu.com/algo/2020/06/17/lkLb5AfrSqhmamZTsZ_XqzFDnSdv_cwr.jpg",
      cwr_compress: "https://cloud-dev.cdn-qn.hzmantu.com/algo/2020/06/17/lkLb5AfrSqhmamZTsZ_XqzFDnSdv_cwr_compress.jpg"
    },
    success: true
  }
  if (res.code === 1) {
    return res.result
  } else {
    return ''
  }
}


/**
 * @description 获取自动修图地址
 * @param {*} params 
 */
export async function getImageAutoBuffing (params) {
  params = {
    ...params,
    flag: process.env.VUE_APP_ALGO_ENV === 'production' ? 'production' : 'dev'
  }

  const wrapBuffingPhotoPath = await hasAutoPhoto(params.url, 'warp_retouch')
  const cropBuffingPhotoPath = await hasAutoPhoto(params.url, 'crop_retouch')
  
  // 拦截监听
  if (wrapBuffingPhotoPath && cropBuffingPhotoPath) return {
    crop_retouch: cropBuffingPhotoPath,
    warp_retouch: wrapBuffingPhotoPath
  }

  return autoAxios({
    url: 'https://sc.algo.hzmantu.com/algo-fix/101/',
    method: 'POST',
    data: params
  }).then(msg => {
    const { result } = msg
    if (!result.warp_retouch) {
      AutoLog.handleBuffingEmpty(params.url, msg)
      return {
        crop_retouch: 'error',
        warp_retouch: 'error'
      }
    }

    AutoLog.handleBuffingInApp(params.url, msg)
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
