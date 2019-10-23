// commonality

import axios from '@/plugins/axios.js'
import { keyToHump } from '../utils/index.js'
import { settlePhoto } from '../utils/photoTool.js'

/**
 * @description 获取修图类型
 */
export function getAllRetouchClass () {
  return axios({
    url: '/project_cloud/common/getAllRetouchClass',
    method: 'GET'
  }).then(res => {
    console.log(res)
    const createData = []
    res.forEach(classItem => {
      createData.push({
        label: classItem.name,
        value: Number(classItem.id)
      })
    })
    return createData
  })
}

/**
 * @description 获取流水信息
 * @param {*} params
 */
export function getStreamInfo (params) {
  return axios({
    url: '/project_cloud/common/getStreamInfo',
    method: 'GET',
    params
  }).then(msg => {
    console.log(keyToHump(msg))
    const data = keyToHump(msg)
    const createData = {}
    let reworkNum = 0
    let plantNum = 0 // 审核种草
    let pullNum = 0 // 审核拔草
    let checkPlantNum = 0
    let checkPullNum = 0
    const retouchAllTime = ((data.retouchTime + data.reviewReturnRebuildTime) / 60).toFixed(2) + 'min'
    const reviewTime = (data.reviewTime / 60).toFixed(2) + 'min'
    data.photos.forEach(photoItem => {
      if (photoItem.tags) {
        reworkNum = photoItem.tags.values && photoItem.tags.values.rework_num && reworkNum < photoItem.tags.values.rework_num
          ? photoItem.tags.values.rework_num
          : reworkNum
      }
      if (photoItem.tags && photoItem.tags.statics && photoItem.tags.statics.includes('plant')) {
        photoItem.grass = 'plant'
        plantNum++
      }
      if (photoItem.tags && photoItem.tags.statics && photoItem.tags.statics.includes('pull')) {
        photoItem.grass = 'pull'
        pullNum++
      }
      const filmEvaluation = photoItem.tags && photoItem.tags.values && photoItem.tags.values.film_evaluation || ''
      const spotGrass = photoItem.tags && photoItem.tags.values && photoItem.tags.values.audit_glass || ''
      photoItem.spotGrass = spotGrass
      if (filmEvaluation && filmEvaluation === 'plant') { checkPlantNum++ }
      if (filmEvaluation && filmEvaluation === 'pull') { checkPullNum++ }
      // 照片版本
      photoItem.photoVersion = photoItem.first_photo
        ? settlePhoto([...photoItem.other_photo_version, photoItem.first_photo])
        : settlePhoto([...photoItem.other_photo_version])
    })
    createData.orderData = {
      streamNum: data.streamNum,
      photographerOrg: data.order ? data.order.photographer_org.name : '-',
      productName: data.product.name,
      photoNum: data.photos.length,
      reworkNum,
      plantNum,
      pullNum,
      retouchAllTime,
      reviewTime,
      overTime: data.hourGlass ? data.hourGlass.over_time : '-',
      checkPlantNum,
      checkPullNum,
      requireLabel: data.tags.values.retouch_claim,
      retouchRemark: data.note.retouch_note || '暂无修片备注',
      reviewerNote: data.reviewerNote || '暂无审核备注'
    }
    createData.photos = data.photos
    if (data.storeEvaluateStream) {
      data.storeEvaluateStream.store_evaluate_star = data.storeEvaluateStream.store_evaluate_star > 5 ? 5 : data.storeEvaluateStream.store_evaluate_star
    }
    createData.storeEvaluateStream = data.storeEvaluateStream
    return createData
  })
}

/**
 * @description 获取又拍云接口
 * @param {*} params
 */
export function getSignature (params) {
  return axios({
    url: '/project_cloud/photoManager/getSignature',
    method: 'GET'
  }).then(msg => {
    return msg
  })
}

/**
 * @description 覆盖上传
 */
export function createPhotoVersion (params) {
  return axios({
    url: '/project_cloud/photoManager/createPhotoVersion',
    method: 'GET',
    params
  })
}
