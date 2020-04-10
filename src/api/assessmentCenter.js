// assessmentCenter
import axios from '@/plugins/axios.js'
import store from '@/store' // vuex
import ProductModel from '@/model/ProductModel.js'
import PhotoModel from '@/model/PhotoModel.js'
import StreamModel from '@/model/StreamModel.js'
import { transformPercentage } from '@/utils/index.js'
import * as SessionTool from '@/utils/sessionTool.js'
import * as PhotoTool from '@/utils/photoTool.js'

/**
 * @description 获取今日抽片指标
 * @param {*} params
 */
export function getStatistics (params) {
  return axios({
    url: '/project_cloud/checkPool/getStatistics',
    method: 'GET'
  }).then(msg => {
    const data = msg
    data.evaluationNum = Math.floor(data.evaluationNum)
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
    let allPhotoPath = [] // 预加载使用
    if (!data.length) {
      SessionTool.removeCloudAssessmentPhotoId()
      return {
        list: [],
        allPhotoPath,
        total: msg.extend.processInfo[0].totalCount,
        pageTotal: msg.total || null
      }
    }
    const total = msg.extend.processInfo[0].totalCount
    data.forEach((item, index) => {
      item.productInfo = new ProductModel(item.photoData.stream.product)
      item.photoInfo = new PhotoModel(item.photoData)
      item.streamInfo = new StreamModel(item.photoData.stream)
      // 照片编号
      const photoIndex = index + params.skip + 1
      item.photoIndex = `${total}-${photoIndex}`
      // 加载预加载，与业务无关
      const photoVersion = item.photoInfo.photoVersion
      allPhotoPath = [...allPhotoPath, ...photoVersion]
    })
    if (!+store.getters.cacheImageSwitch) {
      PhotoTool.readAllPhoto(allPhotoPath)
    }
    const createData = {
      list: data,
      allPhotoPath,
      total,
      pageTotal: msg.total || null
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
    method: 'POST',
    data: params
  }).then(msg => {
    const data = msg.data
    data.forEach(item => {
      item.retouchNote = _.get(item, 'photoData.stream.note.retouch_note', '暂无修图备注')
      item.isReturn = _.get(item, 'photoData.tags.statics', []).includes('return_photo')
      // 照片版本
      item.firstPhoto = item.photoData.first_photo
      item.originalPhoto = item.photoData.other_photo_version.find(item => item.version === 'original_photo')
      item.completePhoto = item.photoData.other_photo_version.find(item => item.version === 'complete_photo')
      item.photoVersion = item.isReturn ? [item.originalPhoto, item.firstPhoto, item.completePhoto] : [item.originalPhoto, item.completePhoto]
      item.productName = _.get(item, 'photoData.stream.product.name', '-')
      item.retouchName = _.get(item, 'photoData.stream.retoucher.name') || _.get(item, 'photoData.stream.retoucher.real_name') || '暂无信息'
      item.retouchLeaderName = _.get(item, 'photoData.stream.retoucher.retoucher_leader.nickname') ||
        _.get(item, 'photoData.stream.retoucher.retoucher_leader.nickname') || '暂无'
      item.retouchStandard = item.retouch_standard

      item.isPull = false
      item.isPlant = false
      if (item.photoData.tags && item.photoData.tags.statics) {
        item.isPull = item.photoData.tags.statics.includes('pull')
        item.isPlant = item.photoData.tags.statics.includes('plant')
      }

      item.storeName = '暂无信息'
      if (item.photoData.stream.order.tags) {
        item.storeName = item.photoData.stream.order.tags.values.store_name
      }

      item.reworkReason = item.photoData.tags.values.rework_reason
      item.grassReason = item.photoData.tags.values.grass_reason
      item.reviewerNote = item.photoData.stream && item.photoData.stream.reviewer_note

      item.isGreen = _.get(item, 'photoData.stream.tags.statics', []).includes('green_stream')

      const retouchRequire = {
        eye: '暂无',
        face: '暂无',
        pimples: false
      }

      item.retouchRequire = _.get(item, 'photoData.stream.tags.values.retouch_claim', retouchRequire)
      item.streamNum = item.photoData.stream.stream_num
    })
    return {
      list: data,
      total: msg.total
    }
  })
}

/**
 * @description 获取问题标签
 * @method GET
 * @returns {Array} 标记数据
 * @author cf 2020/04/10
 * @version @version 2.4.0
 */
export function getScoreConfigList () {
  return axios({
    url: '/project_cloud/checkPool/getScoreConfigList',
    method: 'GET'
  }).then(msg => {
    msg.forEach(item => {
      item.child.forEach(issItem => issItem.isSelect = false)
    })
    return msg
  })
}
