import axios from '@/plugins/axios.js'
import { keyToHump } from '../utils'
import { settlePhoto } from '../utils/photoTool.js'
import store from '@/store' // vuex

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
    if (msg.list) {
      msg.list.forEach(listItem => {
        const completePhoto = listItem.other_photo_version.find(item => item.version === 'complete_photo')
        listItem.src = completePhoto && completePhoto.path || ''
      })
      msg.list = msg.list.filter(listItem => Boolean(listItem.src))
    }
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
    createData.productName = createData.stream.product && createData.stream.product.name || '-'
    createData.customeName = createData.stream &&
      createData.stream.order &&
      createData.stream.order.tags &&
      createData.stream.order.tags.values &&
      createData.stream.order.tags.values.customer_name ||
      '-'
    createData.labelTag = createData.stream.tags && createData.stream.tags.values && createData.stream.tags.values.retouch_claim || {}
    createData.orderMark = createData.stream.order.note.orderNote || '-'
    createData.dresserMark = createData.stream.order.note.dresserNote || '-'
    createData.photographerRemark = createData.stream.note && createData.stream.note.photography_note || '-'
    createData.retouchMark = createData.stream.note && createData.stream.note.retouch_note || '-'
    createData.isPass = Boolean(createData.stream.pass_at)
    // 判断能否打分
    createData.canAttitude = false
    if (!createData.attitude) {
      createData.canAttitude = true
    } else {
      createData.isAttitudeBySelf = createData.attitude.staff_id === store.getters.userInfo.id
      const isAttitudeScore = ['good', 'bad']
      const isAttitude = isAttitudeScore.includes(createData.attitude.attitude)
      createData.canAttitude = createData.isAttitudeBySelf || !isAttitude
    }
    if (createData.isPass) {
      const reworkNum = createData.stream.tags && createData.stream.tags.values && createData.stream.tags.values.rework_num || 0
      const isReturnPhoto = createData.tags && createData.tags.statics && createData.tags.statics.includes('return_photo')
      createData.photoVersion = createData.lastFirstPhoto && isReturnPhoto
        ? settlePhoto([...createData.otherPhotoVersion, createData.lastFirstPhoto], reworkNum)
        : settlePhoto([...createData.otherPhotoVersion], reworkNum)
    } else {
      const originPhoto = createData.otherPhotoVersion.find(item => item.version === 'original_photo')
      createData.photoVersion = [originPhoto]
    }
    createData.workerInfo = {
      storeName: createData.stream.order &&
        createData.stream.order.tags &&
        createData.stream.order.tags.values &&
        createData.stream.order.tags.values.store_name || '-',
      photographer: createData.stream.order &&
        createData.stream.order.tags &&
        createData.stream.order.tags.values &&
        createData.stream.order.tags.values.photographer || '-',
      retoucher: createData.stream.retoucher && (createData.stream.retoucher.name || createData.stream.retoucher.real_name) || '-',
      retouchGroup: createData.stream.retoucher && createData.stream.retoucher.retouch_group && createData.stream.retoucher.retouch_group.name || '-',
      reviewer: createData.stream.reviewer && (createData.stream.reviewer.name || createData.stream.reviewer.real_name) || '-',
      dresser: createData.stream &&
        createData.stream.order &&
        createData.stream.order.tags &&
        createData.stream.order.tags.values &&
        createData.stream.order.tags.values.dresser ||
        '-',
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
    if (msg.list) {
      msg.list.forEach(listItem => {
        const findCompletePhoto = listItem.other_photo_version.find(item => item.version === 'complete_photo')
        listItem.src = findCompletePhoto && findCompletePhoto.path || ''
        listItem.retoucherName = listItem.stream &&
          listItem.stream.retoucher &&
          (listItem.stream.retoucher.name || listItem.stream.retoucher.real_name) || '-'
        listItem.retouchGroupName = listItem.stream &&
          listItem.stream.retoucher &&
          listItem.stream.retoucher.retouch_group &&
          listItem.stream.retoucher.retouch_group.name ||
          '-'
      })
      msg.list = msg.list.filter(listItem => Boolean(listItem.src))
    }
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
    const createData = msg
    const isReturnPhoto = createData.tags && createData.tags.statics && createData.tags.statics.includes('return_photo')
    createData.photoVersion = createData.last_first_photo && isReturnPhoto
      ? settlePhoto([...createData.other_photo_version, createData.last_first_photo], 1)
      : settlePhoto([...createData.other_photo_version], 2)
    createData.productName = createData.stream.product.name
    createData.retoucher = createData.stream.retoucher && (createData.stream.retoucher.name || createData.stream.retoucher.real_name) || '-'
    createData.retoucherLeader = createData.stream.retoucher.retoucher_leader.nickname || createData.stream.retoucher.retoucher_leader.name || '-'
    createData.retouchGroup = createData.stream.retoucher && createData.stream.retoucher.retouch_group && createData.stream.retoucher.retouch_group.name
    return createData
  })
}
