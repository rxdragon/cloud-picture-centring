/* eslint-disable max-len */
/* eslint-disable no-console */
import axios from 'axios'
import ApiError from '../plugins/ApiError'
import uuidv4 from 'uuid'

import MattingImage from '@/components/AutoRetouch/MattingImage'
import * as PhotoTool from '@/utils/photoTool'
import * as AutoLog from '@/views/retoucher-center/autoLog'
import AutoProducts from '@/views/retoucher-center/AutoConfig'
import BackgroundMap from '@/assets/config/BackgroundMap'

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
  [OPERATION_TYPE.WARP]: 'R 智能液化',
  [OPERATION_TYPE.RETOUCH]: 'W 磨皮',
  [OPERATION_TYPE.MATTING]: 'M 抠图',
}

export const OperationBit = {
  [OPERATION_TYPE.CROP]: 0b1000,
  [OPERATION_TYPE.WARP]: 0b0100,
  [OPERATION_TYPE.RETOUCH]: 0b0010,
  [OPERATION_TYPE.MATTING]: 0b0001,
}

// 智能修图状态
export const AutoProcessStates = {
  SUCCESS: 'success', // 成功
  ERROR: 'error', // 失败
  PROCESS_ERROR: 'processError' // 分类器拒绝
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
  uuid = '' // 标示id
  path = '' // 路径
  name = '' // 文件名
  streamNum = '' // 流水号
  isLoaded = false // 是否加载完毕
  showPath = '' // 展示图片
  activate = false // 是否激活
  activeBackgroundImage = ''

  handleSwtich = {
    [OPERATION_TYPE.CROP]: true,
    [OPERATION_TYPE.WARP]: true,
    [OPERATION_TYPE.RETOUCH]: true,
    [OPERATION_TYPE.MATTING]: true,
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

  state = 0 // 自动修图状态

  constructor (photoUrl, streamNum, productId) {
    this.uuid = uuidv4()
    this.path = photoUrl
    this.streamNum = streamNum
    this.name = PhotoTool.realName(photoUrl)
    this.setBaseBackground(productId)
  }

  // 获取自动修图列表
  async getAutoList (useNewAutoApi) {
    const req = { url: this.path }
    const res = await getImageAutoProcess(req, useNewAutoApi)
    this.state = res.state // AutoProcessStates
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
    if (!useNewAutoApi || this.state !== AutoProcessStates.SUCCESS) return
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
    const compressSize = 2048
    const MattingImageClass = new MattingImage(maskPhoto, orgrinPhoto)
    const orgrinPhotoDom = await MattingImageClass.readImageData(orgrinPhoto)

    const canvasHeight = compress ? compressSize : orgrinPhotoDom.naturalHeight
    const canvasWidth = compress ? compressSize : orgrinPhotoDom.naturalWidth

    const { canvas, context } = MattingImageClass.createCanvas(canvasWidth, canvasHeight)
    const mattingImage = await MattingImageClass.drawImage(canvas, context)

    return async (backgroundImage) => {
      const ext = PhotoTool.getFilePostfix(this.name)
      const mimeType = ext.includes('png') ? 'image/png' : 'image/jpeg'
      const compoundImage = await MattingImageClass.addBackground(canvas, context, mattingImage, mimeType, backgroundImage)
      return compoundImage
    }
  }

  setBaseBackground (productId) {
    const productInfo = AutoProducts[productId] || { backgroudMd5: '7277767d4eb0276e8475de21c735f894'}
    const { backgroudMd5 } = productInfo
    const findBackground = BackgroundMap.find(item => item.md5 === backgroudMd5)
    this.activeBackgroundImage = findBackground.localPath
  }
}

/**
 * @description 获取自动修图地址
 * @param {*} params
 */
export async function getImageAutoProcess (params, isNew) {
  params = {
    ...params,
    flag: process.env.VUE_APP_ALGO_ENV === 'production' ? 'production' : 'dev'
  }

  const cr = await hasAutoPhoto(params.url, 'cr_compress')
  const c = await hasAutoPhoto(params.url, 'c_compress')

  const newApiAutoComplete = isNew && cr
  const oldApiAutoComplete = !isNew && c
  if (newApiAutoComplete || oldApiAutoComplete) {
    AutoLog.getPhotoFromQiNiu(params.url, params.flag, isNew)
    return mockAutoRetouch(params.url, isNew)
  }

  // 没有缓存数据
  const apiUrl = isNew ? 'http://algo-dev.hzmantu.com/algo1/102/' : 'https://sc.algo.hzmantu.com/algo1/104/'
  const res = await autoAxios({
    url: apiUrl,
    method: 'POST',
    data: params
  })

  if (res.code === 1) {
    AutoLog.handleInApp(params.url, res, isNew)
    res.result.state = AutoProcessStates.SUCCESS
    return res.result
  } else {
    AutoLog.autoErr(params.url, res)
    return {
      state: res.code === 2 ? AutoProcessStates.PROCESS_ERROR : AutoProcessStates.ERROR,
      c: '',
      c_compress: '',
      cm: '',
      cm_compress: '',
      cr: '',
      cr_compress: '',
      cw: '',
      cw_compress: '',
      cwm: '',
      cwm_compress: '',
      cwr: '',
      cwr_compress: ''
    }
  }
}

function mockAutoRetouch (url, isNew) {
  const algoDomain = process.env.VUE_APP_ALGO_DOMAIN
  const ext = PhotoTool.getFilePostfix(url)
  const pngExt = '.png'
  const name = url.replace(ext, '')
  if (isNew) {
    return {
      c: `${algoDomain}${name}_c${ext}`,
      c_compress: `${algoDomain}${name}_c_compress${ext}`,
      cm: `${algoDomain}${name}_cm${pngExt}`,
      cm_compress: `${algoDomain}${name}_cm_compress${pngExt}`,
      cr: `${algoDomain}${name}_cr${ext}`,
      cr_compress: `${algoDomain}${name}_cr_compress${ext}`,
      cw: `${algoDomain}${name}_cw${ext}`,
      cw_compress: `${algoDomain}${name}_cw_compress${ext}`,
      cwm: `${algoDomain}${name}_cwm${pngExt}`,
      cwm_compress: `${algoDomain}${name}_cwm_compress${pngExt}`,
      cwr: `${algoDomain}${name}_cwr${ext}`,
      cwr_compress: `${algoDomain}${name}_cwr_compress${ext}`,
      state: AutoProcessStates.SUCCESS
    }
  } else {
    return {
      c: `${algoDomain}${name}_c${ext}`,
      c_compress: `${algoDomain}${name}_c_compress${ext}`,
      cw: `${algoDomain}${name}_cw${ext}`,
      cw_compress: `${algoDomain}${name}_cw_compress${ext}`,
      state: AutoProcessStates.SUCCESS
    }
  }
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
