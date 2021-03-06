import axios from '@/plugins/axios.js'
import store from '@/store' // vuex
import { waitTime } from '@/utils/validate'
import { keyToHump } from '@/utils/index'
import { StreamState } from '@/utils/enumerate'
import StreamModel from '@/model/StreamModel.js'
import * as PhotoTool from '@/utils/photoTool.js'

// 获取流水看板数据
/**
 * @description 获取角色组列表
 * @param {*} params
 */
export function getFlowInfo (params) {
  return axios({
    url: '/project_cloud/operator/getFlowInfo',
    method: 'GET',
    params
  }).then(msg => {
    return msg
  })
}

/**
 * @description 获取云端工作指标
 * @param {*} params
 */
export function getCloudRetoucherQuota (params) {
  return axios({
    url: '/project_cloud/operator/getCloudRetoucherQuota',
    method: 'GET',
    params
  }).then(msg => {
    return msg
  })
}

/**
 * @description 获取加急流水查询
 * @param {*} params
 */
export function getStreamList (params) {
  return axios({
    url: '/project_cloud/operator/getStreamList',
    method: 'GET',
    params
  }).then(msg => {
    const streamState = StreamState
    msg.list = msg.list.map(item => {
      const retouchLeader = _.get(item, 'retoucher.retoucher_leader.nickname') ||
        _.get(item, 'retoucher.retoucher_leader.name') || '-'
      if (item.retoucher_org) {
        item.retoucherOrgName = _.get(item, 'retoucher_org.name', '-')
        item.retoucherOrgRetouchName = _.get(item, 'tags.values.retoucher_name', '-')
      }
      const isReceipted = Boolean(_.get(item, 'receipt_at'))
      const retouchTime = waitTime(item.receipt_at, item.pass_at)
      const photographerOrgName = _.get(item, 'order.photographer_org.name') || '-'

      return Object.assign({}, item, {
        staticsUrgent: item.tags && item.tags.statics && item.tags.statics.includes('urgent'),
        isReturn: item.state === 'review_return_retouch',
        retoucherName: _.get(item, 'retoucher.name') || _.get(item, 'retoucher.real_name') || '-',
        retouchLeader,
        retouchType: item.product && item.product.retouch_standard,
        reviewerName: _.get(item, 'reviewer.name') || _.get(item, 'reviewer.real_name') || '-',
        waitTime: waitTime(item.created_at, item.pass_at),
        streamState: streamState[item.state] || item.state,
        photoNum: item.photos.filter(item => +item.people_num > 0).length,
        isReceipted,
        retouchTime,
        photographerOrgName
      })
    })
    return msg
  })
}

/**
 * @description 获取修图流水列表
 * @param {*} params
 */
export function getRetouchStreamList (params) {
  return axios({
    url: '/project_cloud/operator/getRetouchStreamList',
    method: 'GET',
    params
  }).then(msg => {
    const streamState = StreamState
    msg.list = msg.list.map(item => {
      const retouchLeader = _.get(item, 'retoucher.retoucher_leader.nickname') ||
      _.get(item, 'retoucher.retoucher_leader.name') || '-'

      const isReceipted = Boolean(_.get(item, 'receipt_at'))
      const retouchTime = waitTime(item.receipt_at, item.pass_at)
      // 摄影机构
      const photographerOrgName = _.get(item, 'order.photographer_org.name') || '-'

      return Object.assign({}, item, {
        staticsUrgent: item.tags && item.tags.statics && item.tags.statics.includes('urgent'),
        isReturn: item.state === 'review_return_retouch',
        retoucherName: _.get(item, 'retoucher.name') || _.get(item, 'retoucher.real_name') || '-',
        retouchLeader,
        retouchType: item.product && item.product.retouch_standard,
        reviewerName: _.get(item, 'reviewer.name') || _.get(item, 'reviewer.real_name') || '-',
        waitTime: waitTime(item.created_at, item.pass_at),
        streamState: streamState[item.state] || item.state,
        photoNum: item.photos.filter(item => +item.people_num > 0).length,
        isReceipted,
        retouchTime,
        photographerOrgName
      })
    })
    return msg
  })
}

/**
 * @description 获取修图队列数量
 */
export function queueStreamListCount () {
  return axios({
    url: '/project_cloud/operator/queueStreamListCount',
    method: 'GET'
  }).then(msg => {
    return msg
  })
}

/**
 * @description 获取修图或审核中流水列表
 * @param {*} params
 */
export function getQueueStreamList (params) {
  return axios({
    url: '/project_cloud/operator/getQueueStreamList',
    method: 'GET',
    params
  }).then(msg => {
    const streamState = StreamState

    msg.list = msg.list.map(item => {
      const retouchLeader = _.get(item, 'retoucher.retoucher_leader.nickname') ||
      _.get(item, 'retoucher.retoucher_leader.name') || '-'

      const isReceipted = Boolean(_.get(item, 'receipt_at'))
      const retouchTime = waitTime(item.receipt_at, item.pass_at)
      const photographerOrgName = _.get(item, 'order.photographer_org.name') || '-'

      return Object.assign({}, item, {
        staticsUrgent: item.tags && item.tags.statics && item.tags.statics.includes('urgent'),
        isReturn: item.state === 'review_return_retouch',
        retoucherName: _.get(item, 'retoucher.name') || _.get(item, 'retoucher.real_name') || '-',
        retouchLeader,
        retouchType: item.product && item.product.retouch_standard,
        reviewerName: _.get(item, 'reviewer.name') || _.get(item, 'reviewer.real_name') || '-',
        waitTime: waitTime(item.created_at, item.pass_at),
        streamState: streamState[item.state] || item.state,
        photoNum: item.photos.filter(item => +item.people_num > 0).length,
        isReceipted,
        retouchTime,
        photographerOrgName
      })
    })
    return msg
  })
}

/**
 * @description 加急流水
 * @param {*} params
 */
export function urgentStream (params) {
  return axios({
    url: '/project_cloud/operator/urgentStream',
    method: 'PUT',
    data: params
  }).then(msg => {
    return msg
  })
}

/**
 * @description 获取流水信息[只能查到未审核通过流水]
 * @param {*} params
 */
export function getStreamInfo (params) {
  return axios({
    url: '/project_cloud/operator/getStreamInfo',
    method: 'GET',
    params
  }).then(msg => {
    msg = msg[0]
    const data = keyToHump(msg)
    const streamData = new StreamModel(msg)
    const createData = {}
    data.photos.forEach(photoItem => {
      photoItem.specialEfficacy = _.get(photoItem, 'tags.values.special_efficacy') || '无需特效'
      photoItem.photoVersion = PhotoTool.settlePhotoVersion(photoItem.other_photo_version)
    })
    let referencePhoto = _.get(data, 'tags.values.retouch_claim.referenceImg')
    referencePhoto = referencePhoto ? store.getters.imgDomain + referencePhoto : ''

    // 获取订单是否一人成团
    const isChristmasPhoto = _.get(data, 'tags.values.need_auto_created_finish_photo') || false
    if (isChristmasPhoto) {
      const firstPhoto = data.photos[0]
      if (!firstPhoto) return
      createData.christmasSplicePhotos = _.get(firstPhoto, 'tags.values.splice_photos') || []
    }

    createData.orderData = {
      streamNum: data.streamNum,
      photographerOrg: _.get(data, 'order.photographer_org.name') || '-',
      productName: data.product.name,
      photoNum: data.photos.length,
      requireLabel: _.get(data, 'tags.values.retouch_claim', {}),
      referencePhoto,
      retouchRemark: data.note.retouch_note || '暂无修图备注',
      reviewerNote: _.get(data, 'tags.values.review_reason', '暂无审核备注'),
      retouchStandard: data.product.retouch_standard,
      streamState: data.state,
      retoucherName: _.get(data, 'retoucher.name') || _.get(data, 'retoucher.real_name') || '-',
      reviewerName: _.get(data, 'reviewer.name') || '',
      photographerName: _.get(data, 'order.tags.values.photographer') || '-',
      storeName: _.get(data, 'order.tags.values.store_name') || '-',
      ...streamData
    }
    createData.photos = data.photos
    return createData
  })
}

/**
 * @description 直接审核
 * @param {*} params
 */
export function manualReview (params) {
  return axios({
    url: '/project_cloud/operator/manualReview',
    method: 'POST',
    data: params
  })
}

/**
 * @description 获取修图指派列表
 * @param {*} params 
 */
export function getOrderInfoForCloud (params) {
  return axios({
    url: '/himo_product/extend/cloud/get_order_info_for_cloud',
    method: 'POST',
    data: params
  }).then(msg => {
    const storeName = _.get(msg, 'store_info.name') || '-'
    const retouchType = _.get(msg, 'store_info.store_type') || '-'

    const orderList = msg.order_info.map(listItem => {
      const productArr = listItem.order_sale_sku
      
      let productInfo = productArr.map(item => {
        const productName = _.get(item, 'sku_extend.product_name') || ''
        return productName
      })

      productInfo = productInfo.join('，')

      return {
        orderNo: listItem.order_no,
        userName: listItem.user_name,
        userPhone: listItem.user_phone,
        storeName,
        retouchType,
        productInfo
      }
    })
    return orderList
  })
}

/**
 * @description 指派伙伴
 * @param {*} params 
 */
export function advanceAssignOrderToStaff (params) {
  return axios({
    url: '/project_cloud/order/advanceAssignOrderToStaff',
    method: 'POST',
    data: params
  })
}

/**
 * @description 退回队列
 * @param {*} params 
 */
export function returnBackQueue (params) {
  return axios({
    url: '/project_cloud/operator/returnStreamToQueue',
    method: 'PUT',
    data: params
  })
}
