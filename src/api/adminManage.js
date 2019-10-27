import axios from '@/plugins/axios.js'
import { waitTime } from '@/utils/validate'
import { settlePhoto } from '../utils/photoTool.js'
import { keyToHump } from '@/utils/index'
import { StreamState } from '@/utils/enumerate'

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
    const streamState = StreamState()
    msg.list = msg.list.map(item => {
      let retouchLeader = '-'
      if (item.retoucher && item.retoucher.retoucher_leader && item.retoucher.retoucher_leader.name) {
        retouchLeader = item.retoucher.retoucher_leader.name
      }
      if (item.retoucher && item.retoucher.retoucher_leader && item.retoucher.retoucher_leader.nickname) {
        retouchLeader = item.retoucher.retoucher_leader.nickname
      }
      return Object.assign({}, item, {
        staticsUrgent: item.tags && item.tags.statics && item.tags.statics.includes('urgent'),
        isReturn: item.state === 'review_return_retouch',
        retoucherName: item.retoucher && item.retoucher.name || '-',
        retouchLeader,
        retouchType: item.product && item.product.retouch_standard,
        reviewerName: item.reviewer && item.reviewer.name || '-',
        waitTime: waitTime(item.created_at),
        streamState: streamState[item.state] || item.state
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
    const streamState = StreamState()
    msg.list = msg.list.map(item => {
      let retouchLeader = '-'
      if (item.retoucher && item.retoucher.retoucher_leader && item.retoucher.retoucher_leader.name) {
        retouchLeader = item.retoucher.retoucher_leader.name
      }
      if (item.retoucher && item.retoucher.retoucher_leader && item.retoucher.retoucher_leader.nickname) {
        retouchLeader = item.retoucher.retoucher_leader.nickname
      }
      return Object.assign({}, item, {
        staticsUrgent: item.tags && item.tags.statics && item.tags.statics.includes('urgent'),
        isReturn: item.state === 'review_return_retouch',
        retoucherName: item.retoucher && item.retoucher.name || '-',
        retouchLeader,
        retouchType: item.product && item.product.retouch_standard,
        reviewerName: item.reviewer && item.reviewer.name,
        waitTime: waitTime(item.created_at),
        streamState: streamState[item.state] || item.state
      })
    })
    return msg
  })
}

/**
 * @description 获取审核流水列表
 * @param {*} params
 */
export function getReviewStreamList (params) {
  return axios({
    url: '/project_cloud/operator/getReviewStreamList',
    method: 'GET',
    params
  }).then(msg => {
    const streamState = StreamState()
    msg.list = msg.list.map(item => {
      let retouchLeader = '-'
      if (item.retoucher && item.retoucher.retoucher_leader && item.retoucher.retoucher_leader.name) {
        retouchLeader = item.retoucher.retoucher_leader.name
      }
      if (item.retoucher && item.retoucher.retoucher_leader && item.retoucher.retoucher_leader.nickname) {
        retouchLeader = item.retoucher.retoucher_leader.nickname
      }
      return Object.assign({}, item, {
        staticsUrgent: item.tags && item.tags.statics && item.tags.statics.includes('urgent'),
        isReturn: item.state === 'review_return_retouch',
        retoucherName: item.retoucher && item.retoucher.name || '-',
        retouchLeader,
        retouchType: item.product && item.product.retouch_standard,
        reviewerName: item.reviewer && item.reviewer.name || '-',
        waitTime: waitTime(item.created_at),
        streamState: streamState[item.state] || item.state
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
    const createData = {}
    data.photos.forEach(photoItem => {
      photoItem.photoVersion = photoItem.first_photo
        ? settlePhoto([...photoItem.other_photo_version, photoItem.first_photo])
        : settlePhoto([...photoItem.other_photo_version])
    })
    createData.orderData = {
      streamNum: data.streamNum,
      photographerOrg: data.order.photographer_org && data.order.photographer_org.name || '-',
      productName: data.product.name,
      photoNum: data.photos.length,
      requireLabel: data.tags && data.tags.values && data.tags.values.retouch_claim || {},
      retouchRemark: data.note.retouch_note || '暂无修图备注',
      reviewerNote: data.reviewerNote || '暂无审核备注',
      retouchStandard: data.product.retouch_standard,
      streamState: data.state,
      retoucherName: data.retoucher && data.retoucher.name || '-',
      photographer: data.order.tags && data.order.tags.values.photographer || '-'
    }
    createData.photos = data.photos
    return createData
  })
}
