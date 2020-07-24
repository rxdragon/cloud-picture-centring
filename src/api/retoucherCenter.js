// retoucherCenter
const uuidv4 = require('uuid/v4')
import axios from '@/plugins/axios.js'
import StreamModel from '@/model/StreamModel.js'
import ProductModel from '@/model/ProductModel.js'
import OrderModel from '@/model/OrderModel.js'
import { keyToHump } from '@/utils/index.js'
import * as PhotoTool from '@/utils/photoTool.js'

/**
 * @description 流水列表[待修，挂起]
 * @param {*} params [state] [待修，挂起]
 */
export function getRetouchStreams (params) {
  return axios({
    url: '/project_cloud/retoucher/getRetouchStreams',
    method: 'get',
    params
  }).then(msg => {
    msg.data = msg.data.map(listItem => {
      const streamOrder = new StreamModel(listItem)
      const productInfo = new ProductModel(listItem.product)
      listItem.photographerName = _.get(listItem, 'order.photographer_org.name') || '-'
      return {
        ...streamOrder,
        ...listItem,
        ...streamOrder.sandClockInfo,
        productInfo
      }
    })
    return msg
  })
}

/**
 * @description 是否有待修订单
 */
export function hasRetouchingStreams () {
  const params = { state: 'retouching' }
  return axios({
    url: '/project_cloud/retoucher/getRetouchStreams',
    method: 'get',
    params
  }).then(msg => {
    return Boolean(msg.retouchingNum)
  })
}

/**
 * @description 获取流水信息
 * @param {*} params
 */
export function getStreamInfo (params) {
  return axios({
    url: '/project_cloud/retoucher/getStreamInfo',
    method: 'get',
    params
  }).then(msg => {
    const createData = {}
    const streamOrder = new StreamModel(msg)
    const productInfo = new ProductModel(msg.product)
    const orderInfo = new OrderModel(msg.order)
    createData.orderData = {
      ...streamOrder,
      productInfo,
      orderInfo,
      photographerName: _.get(msg, 'order.photographer_org.name') || '-',
      photographer: _.get(msg, 'order.tags.values.photographer') || '-', // 摄影
      photoNum: streamOrder.photoNum
    }
    msg.photos.forEach(photoItem => {
      const findOriginalPhoto = photoItem.photo_version.find(versionItem => versionItem.version === 'original_photo')
      photoItem.path = findOriginalPhoto && PhotoTool.handlePicPath(findOriginalPhoto.path)
      photoItem.orginPhotoPath = photoItem.path
      photoItem.versionCache = { original_photo: findOriginalPhoto }
      photoItem.version = findOriginalPhoto.version
      photoItem.isCover = false
    })
    // 最新退回照片
    const returnShowPhotos = msg.photos.filter(photoItem => {
      const findReturnShowPhoto = photoItem.photo_version.find(versionItem => versionItem.version === 'return_show')
      if (findReturnShowPhoto) {
        const isStoreReturn = photoItem.tags.statics.includes('store_rework')
        if (isStoreReturn) {
          const findLastStorePhoto = PhotoTool.findLastReturnPhoto(photoItem.photo_version)
          photoItem.versionCache['store_rework'] = findLastStorePhoto
          const tagsValues = _.get(photoItem, 'tags.values') || []
          findLastStorePhoto.tags.values = { ...findLastStorePhoto.tags.values, ...tagsValues }
          photoItem.tags = findLastStorePhoto.tags
        }
        photoItem.isReturnPhoto = true
        photoItem.path = findReturnShowPhoto.path
      }
      return Boolean(findReturnShowPhoto)
    })
    createData.photos = returnShowPhotos.length ? returnShowPhotos : msg.photos
    createData.hourGlass = msg.hour_glass
    createData.reviewerNote = _.get(msg, 'tags.values.review_reason', '暂无审核备注')
    createData.isReturnOrder = streamOrder.isCheckReturn || streamOrder.isStoreReturn
    createData.needPunchLabel = msg.order.photographer_org_id === 1 && !createData.isReturnOrder
    return createData
  })
}

/**
  * @description 挂起流水
  * @param {*} params
  */
export function hangStream (params) {
  return axios({
    url: '/project_cloud/retoucher/hangStream',
    method: 'PUT',
    data: params
  })
}

/**
 * @description 提交订单
 */
export function submitStream (params) {
  return axios({
    url: '/project_cloud/retoucher/submitStream',
    method: 'PUT',
    data: params
  })
}

/**
 * @description 获取排队信息
 */
export function getStreamQueueInfo () {
  return axios({
    url: '/project_cloud/retoucher/getStreamQueueInfo',
    method: 'GET'
  }).then(msg => {
    return keyToHump(msg)
  })
}

/**
 * @description 退出队列
 */
export function exitQueue () {
  return axios({
    url: '/project_cloud/retoucher/exitQueue',
    method: 'POST'
  })
}

/**
 * @description 加入队列
 */
export function joinQueue () {
  return axios({
    url: '/project_cloud/retoucher/joinQueue',
    method: 'PUT'
  })
}

/**
 * @description 获取历史修图报告列表
 * @param {*} params
 */
export function getRetouchQuotaList (params) {
  return axios({
    url: '/project_cloud/retoucher/getRetouchQuotaList',
    method: 'GET',
    params
  }).then(msg => {
    const createData = {
      page: msg.pages,
      total: msg.total,
      list: []
    }
    msg.list = msg.list.map(listItem => {
      const streamInfo = new StreamModel(listItem)
      return {
        ...streamInfo,
        peopleTable: PhotoTool.getPhotoPeopleTabel(listItem.photos)
      }
    })
    createData.list = msg.list
    return Object.freeze(createData)
  })
}

/**
 * @description 获取历史修图报告列表
 * @param {*} params
 */
export function getPhotoProblemTagSets () {
  return axios({
    url: '/project_cloud/common/getPhotoProblemTagSets',
    method: 'GET'
  }).then(msg => {
    for (const key in msg) {
      msg[key].forEach(item => {
        item.key = uuidv4()
        item.label = item.name
        item.id = item.id
        item.type = key === 'photography' ? 'problemTagPhotography' : 'problemTagMakeup'
        item.select = false
      })
      msg[key].sort(() => Math.random() - 0.5)
    }
    return msg
  })
}
