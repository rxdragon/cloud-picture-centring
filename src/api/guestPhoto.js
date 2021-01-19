import axios from '@/plugins/axios.js'
import store from '@/store' // vuex
import * as PhotoTool from '@/utils/photoTool.js'
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
    const createInfo = {
      orderNum: _.get(msg, 'stream.order.external_num') || '',
      streamNum: _.get(msg, 'stream.stream_num') || '',
      productName: _.get(msg, 'stream.product.name') || '-',
      customeName: _.get(msg, 'stream.order.tags.values.customer_name') || '-',
      specialEfficacy: _.get(msg, 'tags.values.special_efficacy') || '-',
      labelTag: _.get(msg, 'stream.tags.values.retouch_claim') || {},
      orderMark: _.get(msg, 'stream.order.note.orderNote') || '-',
      dresserMark: _.get(msg, 'stream.order.note.orderNote'),
      photographerRemark: _.get(msg, 'stream.note.photography_note') || '-',
      retouchMark: _.get(msg, 'stream.note.retouch_note') || '-',
      isPass: Boolean(_.get(msg, 'stream.pass_at')),
      canAttitude: false,
      isAttitudeBySelf: _.get(msg, 'attitude.staff_id') === store.getters.userInfo.id,
      attitude: _.get(msg, 'attitude') || {}
    }
    const attitude = _.get(msg, 'attitude.attitude') || ''
    // 判断能否打分
    if (!attitude) {
      createInfo.canAttitude = true
    } else {
      const isAttitudeScore = ['good', 'bad']
      const isAttitude = isAttitudeScore.includes(attitude)
      createInfo.canAttitude = createInfo.isAttitudeBySelf || !isAttitude
    }

    // 处理图片展示版本
    if (createInfo.isPass) {
      const reworkNum = _.get(msg, 'stream.tags.values.rework_num') || 0
      const isStoreReturn = _.get(msg, 'tags.statics', []).includes(PhotoStatics.StoreReturn)
      // 统一显示版本为第一次成片，取消最后一次成品
      createInfo.photoVersion = PhotoTool.settlePhoto([...msg.photo_version], reworkNum, isStoreReturn)
    } else {
      // 不通过只展示原图
      const originPhoto = msg.other_photo_version.find(item => item.version === 'original_photo')
      createInfo.photoVersion = [originPhoto]
    }

    // 兼容单个版本的照片不显示`照片标记提交按钮`
    if (createInfo.photoVersion.length === 1) { createInfo.canAttitude = false }

    const storeEvaluateStream = _.get(msg, 'stream.store_evaluate_stream') || ''
    const storeEvaluateStar = _.get(msg, 'stream.store_evaluate_stream.store_evaluate_star') || 0
    const workerInfo = {
      storeName: _.get(msg, 'stream.order.tags.values.store_name') || '-',
      photographer: _.get(msg, 'stream.order.tags.values.photographer') || '-',
      retoucher: _.get(msg, 'stream.retoucher.name') || _.get(msg, 'stream.retoucher.real_name') || '-',
      retouchGroup: _.get(msg, 'stream.retoucher.retouch_group.name', '-'),
      reviewer: _.get(msg, 'stream.reviewer.name') || _.get(msg, 'stream.reviewer.real_name') || '-',
      dresser: _.get(msg, 'stream.order.tags.values.dresser') || '-',
      watcherName: _.get(msg, 'stream.tags.values.watcher_name') || '-',
      storeEvaluateStar: storeEvaluateStream && storeEvaluateStar,
      storeEvaluateReason: _.get(msg, 'stream.store_evaluate_stream.store_evaluate_reason') || '-'
    }
    createInfo.workerInfo = workerInfo

    return createInfo
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
      ? PhotoTool.settlePhoto([...createData.other_photo_version, createData.last_first_photo], 1, isStoreReturn)
      : PhotoTool.settlePhoto([...createData.other_photo_version], 2, isStoreReturn)
    createData.productName = createData.stream.product.name
    createData.retoucher = retoucherName || retoucherRealName || '-'
    createData.retoucherLeader = retoucherLeaderNickName || retoucherLeaderName || '-'
    createData.retouchGroup = _.get(createData, 'stream.retoucher.retouch_group.name', '')
    return createData
  })
}
