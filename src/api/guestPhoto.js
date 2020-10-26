import axios from '@/plugins/axios.js'
import store from '@/store' // vuex
import { keyToHump } from '@/utils'
import { settlePhoto } from '@/utils/photoTool.js'
import { PhotoStatics } from '@/utils/enumerate.js'

/**
 * @description 获取客片列表
 * @param {*} params
 * @param {*} version 照片版本
 */
export function getPhotoList (params, version = 'complete_photo') {
  return axios({
    url: '/project_cloud/photoPool/getPhotoList',
    method: 'POST',
    data: params
  }).then(msg => {
    msg.forEach(listItem => {
      const completePhoto = listItem.other_photo_version.find(item => item.version === version)
      listItem.src = _.get(completePhoto, 'path', '')
    })

    msg = msg.filter(listItem => Boolean(listItem.src))
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
    createData.productName = _.get(createData, 'stream.product.name', '-')
    createData.customeName = _.get(createData, 'stream.order.tags.values.customer_name', '-')
    createData.specialEfficacy = _.get(createData, 'tags.values.special_efficacy')
    createData.labelTag = _.get(createData, 'stream.tags.values.retouch_claim', {})
    createData.orderMark = _.get(createData, 'stream.order.note.orderNote', '-')
    createData.dresserMark = _.get(createData, 'stream.order.note.dresserNote', '-') || '-'
    createData.photographerRemark = _.get(createData, 'stream.note.photography_note', '-')
    createData.retouchMark = _.get(createData, 'stream.note.retouch_note', '-')
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
      const reworkNum = _.get(createData, 'stream.tags.values.rework_num', 0)
      const isReturnPhoto = _.get(createData, 'tags.statics', []).includes(PhotoStatics.CheckReturn)
      const isStoreReturn = _.get(createData, 'tags.statics', []).includes(PhotoStatics.StoreReturn)
      createData.photoVersion = createData.lastFirstPhoto && isReturnPhoto
        ? settlePhoto([...createData.otherPhotoVersion, createData.lastFirstPhoto], reworkNum, isStoreReturn)
        : settlePhoto([...createData.otherPhotoVersion], reworkNum, isStoreReturn)
    } else {
      const originPhoto = createData.otherPhotoVersion.find(item => item.version === 'original_photo')
      createData.photoVersion = [originPhoto]
    }
    
    // 兼容单个版本的照片不显示`照片标记提交按钮`
    if (createData.photoVersion.length === 1) { createData.canAttitude = false }

    const storeEvaluateStream = _.get(createData, 'stream.store_evaluate_stream')
    const storeEvaluateStar = _.get(createData, 'stream.store_evaluate_stream.store_evaluate_star')
    createData.workerInfo = {
      storeName: _.get(createData, 'stream.order.tags.values.store_name', '-'),
      photographer: _.get(createData, 'stream.order.tags.values.photographer', '-'),
      retoucher: _.get(createData, 'stream.retoucher.name') || _.get(createData, 'stream.retoucher.real_name') || '-',
      retouchGroup: _.get(createData, 'stream.retoucher.retouch_group.name', '-'),
      reviewer: _.get(createData, 'stream.reviewer.name') || _.get(createData, 'stream.reviewer.real_name') || '-',
      dresser: _.get(createData, 'stream.order.tags.values.dresser', '-'),
      watcherName: _.get(createData, 'stream.tags.values.watcher_name', '-'),
      storeEvaluateStar: storeEvaluateStream && storeEvaluateStar,
      storeEvaluateReason: _.get(createData, 'stream.store_evaluate_stream.store_evaluate_reason', '-')
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
    msg.forEach(listItem => {
      const findCompletePhoto = listItem.other_photo_version.find(item => item.version === 'complete_photo')
      const retoucherName = _.get(listItem, 'stream.retoucher.name')
      const retoucherRealName = _.get(listItem, 'stream.retoucher.real_name')
      listItem.src = _.get(findCompletePhoto, 'path', '')
      listItem.retoucherName = retoucherName || retoucherRealName || '-'
      listItem.retouchGroupName = _.get(listItem, 'stream.retoucher.retouch_group.name', '-')
    })
    msg = msg.filter(listItem => Boolean(listItem.src))
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
    const isReturnPhoto = _.get(createData, 'tags.statics', []).includes(PhotoStatics.CheckReturn)
    const isStoreReturn = _.get(createData, 'tags.statics', []).includes(PhotoStatics.StoreReturn)
    const retoucherName = _.get(createData, 'stream.retoucher.name')
    const retoucherRealName = _.get(createData, 'stream.retoucher.real_name')
    const retoucherLeaderNickName = _.get(createData, 'stream.retoucher.retoucher_leader.nickname')
    const retoucherLeaderName = _.get(createData, 'stream.retoucher.retoucher_leader.name')
    createData.photoVersion = createData.last_first_photo && isReturnPhoto
      ? settlePhoto([...createData.other_photo_version, createData.last_first_photo], 1, isStoreReturn)
      : settlePhoto([...createData.other_photo_version], 2, isStoreReturn)
    createData.productName = createData.stream.product.name
    createData.retoucher = retoucherName || retoucherRealName || '-'
    createData.retoucherLeader = retoucherLeaderNickName || retoucherLeaderName || '-'
    createData.retouchGroup = _.get(createData, 'stream.retoucher.retouch_group.name', '')
    return createData
  })
}
