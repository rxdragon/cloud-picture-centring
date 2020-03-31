// commonality

import axios from '@/plugins/axios.js'
import { keyToHump } from '@/utils/index.js'
import { settlePhoto } from '@/utils/photoTool.js'
import { PhotoStatics } from '@/utils/enumerate.js'

/**
 * @description 获取修图类型
 */
export function getAllRetouchClass () {
  return axios({
    url: '/project_cloud/common/getAllRetouchClass',
    method: 'GET'
  }).then(res => {
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
    const data = keyToHump(msg)
    const createData = {}
    const plantNum = _.get(data, 'tags.values.plant_num', 0) // 审核种草
    const pullNum = _.get(data, 'tags.values.pull_num', 0) // 审核拔草
    let checkPlantNum = 0
    let checkPullNum = 0
    const reworkNum = _.get(data, 'tags.values.rework_num', 0)
    const retouchAllTime = ((data.retouchTime + data.reviewReturnRebuildTime) / 60).toFixed(2) + 'min'
    const reviewTime = (data.reviewTime / 60).toFixed(2) + 'min'
    data.photos.forEach(photoItem => {
      const isReturnPhoto = photoItem.tags && photoItem.tags.statics && photoItem.tags.statics.includes(PhotoStatics.CheckReturn)
      const isStoreReturn = photoItem.tags && photoItem.tags.statics && photoItem.tags.statics.includes(PhotoStatics.StoreReturn)
      if (photoItem.tags && photoItem.tags.statics && photoItem.tags.statics.includes('plant')) {
        photoItem.grass = 'plant'
      }
      if (photoItem.tags && photoItem.tags.statics && photoItem.tags.statics.includes('pull')) {
        photoItem.grass = 'pull'
      }
      const filmEvaluation = _.get(photoItem, 'tags.values.film_evaluation', '')
      const spotGrass = _.get(photoItem, 'tags.values.audit_glass', '')
      photoItem.spotGrass = spotGrass
      photoItem.filmEvaluation = filmEvaluation
      if (filmEvaluation && filmEvaluation === 'plant') {
        checkPlantNum++
      }
      if (filmEvaluation && filmEvaluation === 'pull') {
        checkPullNum++
      }
      photoItem.reworkNum = reworkNum
      // 照片版本
      if (photoItem.other_photo_version.length === 1 && photoItem.other_photo_version[0].version === 'finish_photo') {
        // 过滤看片师新增照片
        photoItem.photoVersion = ''
      } else {
        photoItem.otherPhotoVersion = photoItem.other_photo_version.filter(versionItem => versionItem.version !== 'store_rework')
        photoItem.last_store_rework_photo && (photoItem.otherPhotoVersion = [...photoItem.otherPhotoVersion, photoItem.last_store_rework_photo])
        photoItem.photoVersion = photoItem.first_photo && isReturnPhoto
          ? settlePhoto([...photoItem.otherPhotoVersion, photoItem.first_photo], reworkNum, isStoreReturn)
          : settlePhoto([...photoItem.otherPhotoVersion], reworkNum, isStoreReturn)
      }
      if (photoItem.photoVersion) {
        photoItem.photoVersion.forEach(versionItem => {
          versionItem.isLekima = versionItem.tags &&
            versionItem.tags.statics &&
            versionItem.tags.statics.includes('lichma')
        })
      }
    })
    data.photos = data.photos.filter(photoItem => Boolean(photoItem.photoVersion))
    createData.orderData = {
      streamNum: data.streamNum,
      photographerOrg: data.order ? data.order.photographer_org.name : '-',
      productName: _.get(data, 'product.name', '-'),
      photoNum: data.photos.filter(item => +item.people_num > 0).length,
      photographerName: _.get(data, 'order.tags.values.photographer', '-'),
      reworkNum,
      plantNum,
      pullNum,
      retouchAllTime,
      reviewTime,
      overTime: data.hourGlass ? data.hourGlass.over_time : '-',
      checkPlantNum,
      checkPullNum,
      requireLabel: _.get(data, 'tags.values.retouch_claim', {}),
      retouchRemark: data.note.retouch_note || '暂无修图备注',
      backgroundColor: msg.note.color_note || '',
      reviewerNote: _.get(data, 'tags.values.review_reason', '暂无审核备注')
    }
    createData.photos = data.photos
    if (data.storeEvaluateStream) {
      data.storeEvaluateStream.store_evaluate_star = data.storeEvaluateStream.store_evaluate_star > 5 ? 5 : data.storeEvaluateStream.store_evaluate_star
    }
    createData.storeEvaluateStream = data.storeEvaluateStream
    const retoucherNpsAvg = _.get(data, 'tags.values.retoucher_score', '-')
    const npsAvgEnum = { 10: `超满意（10分）`, 6: `基本满意（6分）`, 2: `不满意（2分）` }
    createData.retoucherNpsAvg = npsAvgEnum[+retoucherNpsAvg] || `${retoucherNpsAvg}分`
    return createData
  })
}

/**
 * @description 获取七牛云接口
 * @param {*} params
 */
export function getSignature (params) {
  return axios({
    url: '/project_cloud/photoManager/getUploadToken',
    method: 'GET'
  }).then(msg => {
    const createData = {
      token: msg
    }
    return createData
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
