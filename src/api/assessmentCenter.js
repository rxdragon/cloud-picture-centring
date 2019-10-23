// assessmentCenter
import axios from '@/plugins/axios.js'
import { transformPercentage } from '@/utils/index.js'

/**
 * @description 获取今日抽片指标
 * @param {*} params
 */
export function getStatistics (params) {
  return axios({
    url: '/project_cloud/checkPool/getStatistics',
    method: 'GET'
  }).then(msg => {
    console.log(msg, '今日抽片指标')
    const data = msg
    data.plantPercent = transformPercentage(data.plantNum, data.evaluationNum)
    data.pullPercent = transformPercentage(data.pullNum, data.evaluationNum)
    return data
  })
}

/**
 * @description 抽片
 * @param {*} params
 */
export function takePhoto (params) {
  return axios({
    url: '/project_cloud/checkPool/takePhoto',
    method: 'POST',
    data: params
  }).then(msg => {
    return msg
  })
}

/**
 * @description 获取是否有未评分的抽片
 * @param {*} params
 */
export function getHaveCheckResult (params) {
  return axios({
    url: '/project_cloud/checkPool/getHaveCheckResult',
    method: 'GET',
    params
  })
}

/**
 * @description 获取抽片结果
 * @param {*} params
 */
export function getSpotCheckResult (params) {
  return axios({
    url: '/project_cloud/checkPool/getSpotCheckResult',
    method: 'GET',
    params
  }).then(msg => {
    const data = msg.data
    data.forEach(item => {
      item.reviewerNote = item.photoData.stream && item.photoData.stream.reviewer_note || '暂无备注'
      item.retouchNote = item.photoData.stream && item.photoData.stream.note.retouch_note || '-'
      item.isReturn = item.photoData.tags && item.photoData.tags.statics && item.photoData.tags.statics.includes('rework') || false
      // 照片版本
      item.firstPhoto = item.photoData.first_photo
      item.originalPhoto = item.photoData.other_photo_version.find(item => item.version === 'original_photo')
      item.completePhoto = item.photoData.other_photo_version.find(item => item.version === 'complete_photo')
      item.photoVersion = item.isReturn ? [item.originalPhoto, item.firstPhoto, item.completePhoto] : [item.originalPhoto, item.completePhoto]
      item.retouchStandard = item.retouch_standard
      item.productName = item.photoData.stream.product.name
      item.isPull = item.photoData.tags && item.photoData.tags.statics && item.photoData.tags.statics.includes('pull') || false
      item.isPlant = item.photoData.tags && item.photoData.tags.statics && item.photoData.tags.statics.includes('plant') || false
      item.grassReason = item.photoData.tags && item.photoData.tags.values && item.photoData.tags.values.grass_reason || '暂无原因'
      item.reworkReason = item.photoData.tags && item.photoData.tags.values && item.photoData.tags.values.rework_reason || '暂无重修原因'
      item.retouchRequire = {
        eye: '暂无',
        face: '暂无',
        pimples: false
      }
      if (item.photoData.stream.tags) {
        item.retouchRequire = item.photoData.stream.tags.values.retouch_claim
      }
    })
    const createData = {
      list: data,
      total: msg.extend.processInfo[0].totalCount
    }
    return createData
  })
}

/**
 * @description 提交评价
 * @param {*} params
 */
export function commitHistory (params) {
  return axios({
    url: '/project_cloud/checkPool/commitHistory',
    method: 'POST',
    data: params
  })
}

/**
 * @description 获取历史抽片数据
 * @param {*} params
 */
export function getSearchHistory (params) {
  return axios({
    url: '/project_cloud/checkPool/getSearchHistory',
    method: 'GET',
    params
  }).then(msg => {
    const data = msg.data
    console.log(data)
    data.forEach(item => {
      item.reviewerNote = item.photoData.stream.reviewer_note || '暂无审核备注'
      item.retouchNote = item.photoData.stream.note.retouch_note
      item.isReturn = item.photoData.tags && item.photoData.tags.statics && item.photoData.tags.statics.includes('rework') || false
      // 照片版本
      item.firstPhoto = item.photoData.first_photo
      item.originalPhoto = item.photoData.other_photo_version.find(item => item.version === 'original_photo')
      item.completePhoto = item.photoData.other_photo_version.find(item => item.version === 'complete_photo')
      item.photoVersion = item.isReturn ? [item.originalPhoto, item.firstPhoto, item.completePhoto] : [item.originalPhoto, item.completePhoto]
      item.productName = item.photoData.stream.product.name
      item.retouchName = item.photoData.stream.retoucher.name || '暂无信息'

      item.isPull = false
      item.isPlant = false
      if (item.photoData.tags.statics) {
        item.isPull = item.photoData.tags.statics.includes('pull')
        item.isPlant = item.photoData.tags.statics.includes('plant')
      }

      item.storeName = '暂无信息'
      if (item.photoData.stream.order.tags) {
        item.storeName = item.photoData.stream.order.tags.values.store_name
      }

      item.grassReason = item.photoData.tags.values.grass_reason || '暂无原因'
      item.reworkReason = item.photoData.tags.values.rework_reason || '暂无重修原因'

      item.retouchRequire = {
        eye: '暂无',
        face: '暂无',
        pimples: false
      }
      item.retouchRequire = item.photoData.stream.tags.values.retouch_claim
      item.streamNum = item.photoData.stream.stream_num
    })
    return {
      list: data,
      total: msg.total
    }
  })
}

