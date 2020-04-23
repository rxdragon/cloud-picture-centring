import axios from '@/plugins/axios.js'
import { waitTime } from '@/utils/validate'
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
    const streamState = StreamState
    msg.list = msg.list.map(item => {
      let retouchLeader = '-'
      if (item.retoucher && item.retoucher.retoucher_leader && item.retoucher.retoucher_leader.name) {
        retouchLeader = item.retoucher.retoucher_leader.name
      }
      if (item.retoucher && item.retoucher.retoucher_leader && item.retoucher.retoucher_leader.nickname) {
        retouchLeader = item.retoucher.retoucher_leader.nickname
      }
      if (item.retoucher_org) {
        item.retoucherOrgName = _.get(item, 'retoucher_org.name', '-')
        item.retoucherOrgRetouchName = _.get(item, 'tags.values.retoucher_name', '-')
      }
      return Object.assign({}, item, {
        staticsUrgent: item.tags && item.tags.statics && item.tags.statics.includes('urgent'),
        isReturn: item.state === 'review_return_retouch',
        retoucherName: _.get(item, 'retoucher.name') || _.get(item, 'retoucher.real_name') || '-',
        retouchLeader,
        retouchType: item.product && item.product.retouch_standard,
        reviewerName: _.get(item, 'reviewer.name') || _.get(item, 'reviewer.real_name') || '-',
        waitTime: waitTime(item.created_at, item.pass_at),
        streamState: streamState[item.state] || item.state,
        photoNum: item.photos.filter(item => +item.people_num > 0).length
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
        retoucherName: _.get(item, 'retoucher.name') || _.get(item, 'retoucher.real_name') || '-',
        retouchLeader,
        retouchType: item.product && item.product.retouch_standard,
        reviewerName: _.get(item, 'reviewer.name') || _.get(item, 'reviewer.real_name') || '-',
        waitTime: waitTime(item.created_at, item.pass_at),
        streamState: streamState[item.state] || item.state,
        photoNum: item.photos.filter(item => +item.people_num > 0).length
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
        retoucherName: _.get(item, 'retoucher.name') || _.get(item, 'retoucher.real_name') || '-',
        retouchLeader,
        retouchType: item.product && item.product.retouch_standard,
        reviewerName: _.get(item, 'reviewer.name') || _.get(item, 'reviewer.real_name') || '-',
        waitTime: waitTime(item.created_at, item.pass_at),
        streamState: streamState[item.state] || item.state,
        photoNum: item.photos.filter(item => +item.people_num > 0).length
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
      const photoVersionArr = ['original_photo', 'complete_photo', 'last_retouch_photo', 'finish_photo'] // 过滤掉除原片，云端成片，最新修片，顾客满意片这四个版本以外其他照片
      photoItem.otherPhotoVersion = photoItem.other_photo_version.filter(versionItem => photoVersionArr.indexOf(versionItem.version) !== -1)
      photoItem.last_store_rework_photo && (photoItem.otherPhotoVersion = [...photoItem.otherPhotoVersion, photoItem.last_store_rework_photo])
    })
    createData.orderData = {
      streamNum: data.streamNum,
      photographerOrg: _.get(data, 'order.photographer_org.name', '-'),
      productName: data.product.name,
      photoNum: data.photos.length,
      requireLabel: _.get(data, 'tags.values.retouch_claim', {}),
      retouchRemark: data.note.retouch_note || '暂无修图备注',
      reviewerNote: _.get(data, 'tags.values.review_reason', '暂无审核备注'),
      retouchStandard: data.product.retouch_standard,
      streamState: data.state,
      retoucherName: _.get(data, 'retoucher.name') || _.get(data, 'retoucher.real_name') || '-',
      reviewerName: _.get(data, 'reviewer.name', ''),
      photographerName: _.get(data, 'order.tags.values.photographer', '-')
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
