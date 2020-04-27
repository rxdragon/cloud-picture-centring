// commonality
import axios from '@/plugins/axios.js'
import { keyToHump } from '@/utils/index.js'
import * as PhotoTool from '@/utils/photoTool.js'
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
    const reworkNum = _.get(data, 'tags.values.rework_num') || 0
    const storeReworkNum = _.get(data, 'tags.values.store_rework_num') || 0
    const store_evaluate = _.get(data, 'storeEvaluateStream.store_evaluate') || '-'
    let retoucherNpsAvg = _.get(data, 'tags.values.retoucher_score') || '-'
    const npsAvgEnum = { 10: `超满意（10分）`, 6: `基本满意（6分）`, 2: `不满意（2分）` }
    retoucherNpsAvg = npsAvgEnum[+retoucherNpsAvg] || `${retoucherNpsAvg}`
    const retouchAllTime = ((data.retouchTime + data.reviewReturnRebuildTime) / 60).toFixed(2) + 'min'
    const reviewTime = (data.reviewTime / 60).toFixed(2) + 'min'
    data.photos.forEach(photoItem => {
      const isReturnPhoto = _.get(photoItem, 'tags.statics', []).includes(PhotoStatics.CheckReturn)
      const isStoreReturn = _.get(photoItem, 'tags.statics', []).includes(PhotoStatics.StoreReturn)
      const filmEvaluation = _.get(photoItem, 'tags.values.film_evaluation') || ''
      photoItem.filmEvaluation = filmEvaluation
      photoItem.reworkNum = reworkNum
      // 照片版本
      if (photoItem.other_photo_version.length === 1 && photoItem.other_photo_version[0].version === 'finish_photo') {
        // 过滤看片师新增照片
        photoItem.photoVersion = ''
      } else {
        // 过滤掉除原片，云端成片，最新修片，顾客满意片这四个版本以外其他照片
        const photoVersionArr = ['original_photo', 'complete_photo', 'last_retouch_photo', 'finish_photo']
        photoItem.otherPhotoVersion = photoItem.other_photo_version.filter(versionItem => photoVersionArr.indexOf(versionItem.version) !== -1)
        photoItem.last_store_rework_photo && (photoItem.otherPhotoVersion = [...photoItem.otherPhotoVersion, photoItem.last_store_rework_photo])
        photoItem.photoVersion = photoItem.first_photo && isReturnPhoto
          ? PhotoTool.settlePhoto([...photoItem.otherPhotoVersion, photoItem.first_photo], reworkNum, isStoreReturn)
          : PhotoTool.settlePhoto([...photoItem.otherPhotoVersion], reworkNum, isStoreReturn)
      }
      if (photoItem.photoVersion) {
        photoItem.photoVersion.forEach(versionItem => {
          versionItem.isLekima = _.get(versionItem, 'tags.statics', []).includes('lichma')
          versionItem.versionCache = PhotoTool.filtePhotoVersion(photoItem.photoVersion, ['original_photo', 'complete_photo'])
          versionItem.phototag = photoItem.tags
        })
      }
    })
    data.photos = data.photos.filter(photoItem => Boolean(photoItem.photoVersion))
    createData.orderData = {
      streamNum: data.streamNum,
      photographerOrg: data.order ? data.order.photographer_org.name : '-',
      productName: _.get(data, 'product.name', '-'),
      photoNum: data.photos.filter(item => +item.people_num > 0).length,
      photographerName: _.get(data, 'order.tags.values.photographer') || '-',
      reworkNum,
      storeReworkNum,
      retouchAllTime,
      retoucherNpsAvg,
      reviewTime,
      store_evaluate,
      overTime: data.hourGlass ? data.hourGlass.over_time + 'min' : '-',
      requireLabel: _.get(data, 'tags.values.retouch_claim', {}),
      retouchRemark: data.note.retouch_note || '暂无修图备注',
      backgroundColor: msg.note.color_note || '',
      reviewerNote: _.get(data, 'tags.values.review_reason', '暂无审核备注')
    }
    createData.photos = data.photos
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
