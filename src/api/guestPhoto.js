import axios from '@/plugins/axios.js'
import { keyToHump } from '../utils'

/**
 * @description 获取客片列表
 * @param {*} params
 */
export function getPhotoList (params) {
  return axios({
    url: '/project_cloud/photoPool/getPhotoList',
    method: 'POST',
    data: params
  }).then(msg => {
    msg.list && msg.list.forEach(listItem => {
      const findCompletePhoto = listItem.other_photo_version.find(item => item.version === 'complete_photo')
      listItem.src = findCompletePhoto && findCompletePhoto.path || ''
    })
    return msg
  })
}

/**
 * @description 获取客片详情
 * @param {*} params
 */
export function getPhotoInfo (params) {
  return axios({
    url: '/project_cloud/photoPool/getPhotoInfo',
    method: 'GET',
    params
  }).then(msg => {
    const createData = keyToHump(msg)
    createData.orderNum = createData.stream.order.external_num
    createData.streamNum = createData.stream.stream_num
    createData.productName = createData.stream.product.name
    createData.labelTag = createData.stream.tags && createData.stream.tags.values && createData.stream.tags.values.retouch_claim || {}
    createData.orderMark = createData.stream.order.note.orderNote || '-'
    createData.dresserMark = createData.stream.order.note.dresserNote || '-'
    createData.photographerRemark = createData.stream.note && createData.stream.note.photography_note || '-'
    createData.retouchMark = createData.stream.note && createData.stream.note.retouch_note || '-'
    createData.workerInfo = {
      storeName: createData.stream.order.tags.values.store_name,
      photographer: createData.stream.order.tags.values.photographer,
      retoucher: createData.stream.retoucher.name,
      retouchGroup: createData.stream.retoucher.retouch_group.name,
      reviewer: createData.stream.reviewer && createData.stream.reviewer.name || '-',
      watcherName: createData.stream.tags.values && createData.stream.tags.values.watcher_name || '-',
      storeEvaluateStar: createData.stream.store_evaluate_stream && createData.stream.store_evaluate_stream.store_evaluate_star,
      storeEvaluateReason: createData.stream.store_evaluate_stream && createData.stream.store_evaluate_stream.store_evaluate_reason || '-'
    }
    return createData
  })
}

/**
 * @description 提交【踩/赞】
 * @param {*} params
 */
export function submitAttitude (params) {
  return axios({
    url: '/project_cloud/photoPool/submitAttitude',
    method: 'POST',
    data: params
  })
}

/**
 * @description 获取优秀问题客片列表
 * @param {*} params
 */
export function getAttitudePhotoList (params) {
  return axios({
    url: '/project_cloud/photoPool/getAttitudePhotoList',
    method: 'POST',
    data: params
  }).then(msg => {
    msg.list.forEach(listItem => {
      const findCompletePhoto = listItem.other_photo_version.find(item => item.version === 'original_photo')
      listItem.src = findCompletePhoto && findCompletePhoto.path || ''
    })
    return msg
  })
}

/**
 * @description 获取优秀或者问题客片详情
 * @param {*} params
 */
export function getAttitudePhotoInfo (params) {
  return axios({
    url: '/project_cloud/photoPool/getAttitudePhotoInfo',
    method: 'GET',
    params
  }).then(msg => {
    const createData = keyToHump(msg)
    createData.productName = createData.stream.product.name
    createData.retoucher = createData.stream.retoucher.name
    createData.retoucherLeader = createData.stream.retoucher.retoucher_leader.nickname || createData.stream.retoucher.retoucher_leader.name || '-'
    createData.retouchGroup = createData.stream.retoucher.retouch_group.name
    return createData
  })
}
