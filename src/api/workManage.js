import axios from '@/plugins/axios.js'
import { keyToHump, transformPercentage, isObj, getAvg, timeFormat } from '../utils'

/** 工作指标 */

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
    const createData = {}
    const data = keyToHump(msg)
    let finishPhotoPercent = '0%'
    if (data.cloud.finishPhotoNum && data.cloud.uploadPhotoNum) {
      finishPhotoPercent = transformPercentage(data.cloud.finishPhotoNum, data.cloud.uploadPhotoNum)
    }
    createData.listData = [{
      label: '预计完成总量',
      value: data.cloud.expectPhotoNum
    }, {
      label: '实际上传总量',
      value: data.cloud.uploadPhotoNum
    }, {
      label: '已完成总量（张）',
      value: data.cloud.finishPhotoNum
    }, {
      label: '预计完成率',
      value: '暂无数据'
    }, {
      label: '实际完成率',
      value: finishPhotoPercent
    }]
    createData.groups = data.groups
    return createData
  })
}

/**
 * @description 编辑修图组目标指标今日
 * @param {*} params
 */
export function editRetoucherGroupTargetQuota (params) {
  return axios({
    url: '/project_cloud/operator/editRetoucherGroupTargetQuota',
    method: 'PUT',
    data: params
  })
}

/**
 * @description 保存建议工作量
 * @param {*} params
 */
export function getSuggestWorkload (params) {
  return axios({
    url: '/project_cloud/config/getSuggestWorkload',
    method: 'PUT',
    data: params
  })
}

/**
 * @description 获取伙伴绩效
 * @param {*} params
 */
export function getRetoucherQuota (params) {
  return axios({
    url: '/project_cloud/operator/getRetoucherQuota',
    method: 'POST',
    data: params
  }).then(msg => {
    msg.retouchSinglePhotoNum = Number(msg.retouchSinglePhotoNum)
    msg.retouchMultiPhotoNum = Number(msg.retouchMultiPhotoNum)
    msg.income = Number(msg.income.impulse) + Number(msg.income.retouch)
    const count = Number(msg.retoucherFinishPhotoNum)
    msg.reviewPlantRate = transformPercentage(msg.reviewPlant, count)
    msg.reviewPullRate = transformPercentage(msg.reviewPull, count)
    msg.retouchReworkRate = transformPercentage(msg.retouchRework, msg.retoucherFinishStreamNum)
    return msg
  })
}

/**
 * @description 获取总体绩效
 * @param {*} params
 */
export function getWholeQuota (params) {
  return axios({
    url: '/project_cloud/operator/getWholeQuota',
    method: 'GET',
    params
  }).then(data => {
    for (const key in data) {
      if (isObj(data[key])) {
        data[key] = `${data[key].single} / ${data[key].multi}`
      }
      if (['reviewPhotoPlantNum', 'reviewPhotoPullNum', 'retouchReworkNum'].includes(key)) {
        data[key] = `${data[key] * 100}%`
      }
    }
    return data
  })
}

/**
 * @description 获取审核绩效[审与被审]
 * @param {*} params
 */
export function getReviewQuota (params) {
  return axios({
    url: '/project_cloud/operator/getReviewQuota',
    method: 'GET',
    params
  }).then(data => {
    const formatNumAndRate = (num, allNum) => {
      const rate = transformPercentage(num, allNum)
      return `${num} / ${rate}`
    }
    if (!Object.keys(data).length) return null
    const avgTime = getAvg(data.reviewTimeAvg.sum, data.reviewTimeAvg.count)
    const res = {
      review_stream_num: data.reviewStreamNum,
      review_photo_num: data.reviewPhotoNum,
      review_time_avg: timeFormat(avgTime, 'text', true),
      review_photo_glass_plant: formatNumAndRate(data.reviewPhotoGlass.plant.num, data.reviewPhotoNum),
      review_photo_glass_pull: formatNumAndRate(data.reviewPhotoGlass.pull.num, data.reviewPhotoNum),
      spot_check_photo_glass_plant: formatNumAndRate(data.spotCheckPhotoGlass.plant.num, data.spotCheckPhotoNum),
      spot_check_photo_glass_pull: formatNumAndRate(data.spotCheckPhotoGlass.pull.num, data.spotCheckPhotoNum),
      rectify_photo_different: formatNumAndRate(data.rectifyPhoto.different.num, data.spotCheckPhotoNum),
      rectify_photo_different_grass_plant: formatNumAndRate(data.rectifyPhoto.differentGrass.plant.num, data.spotCheckPhotoNum),
      rectify_photo_different_grass_pull: formatNumAndRate(data.rectifyPhoto.differentGrass.pull.num, data.spotCheckPhotoNum),
      rectify_photo_different_grass_no_grass: formatNumAndRate(data.rectifyPhoto.differentGrass.noGrass.num, data.spotCheckPhotoNum),
      rectify_photo_same: formatNumAndRate(data.rectifyPhoto.same.num, data.spotCheckPhotoNum)
    }
    return res
  })
}

/**
 * @description 获取流水时间指标
 * @param {*} params
 */
export function getStreamTimesQuota (params) {
  return axios({
    url: '/project_cloud/operator/getStreamTimesQuota',
    method: 'GET',
    params
  })
}

/**
 * @description 获取门店评价
 * @param {*} params
 */
export function getStoreEvaluate (params) {
  return axios({
    url: '/project_cloud/operator/getStoreEvaluate',
    method: 'POST',
    data: params
  })
}

/**
 * @description 获取流水信息【只能查到未审核通过流水】
 * @param {*} params
 */
export function getStreamInfo (params) {
  return axios({
    url: '/project_cloud/operator/getStreamInfo',
    method: 'GET',
    params
  }).then(msg => {
    msg.forEach(listItem => {
      listItem.photos.forEach(photoItem => {
        photoItem.isDelete = false
        photoItem.isJoint = photoItem.tags && photoItem.tags.values && Boolean(photoItem.tags.values.splice_mark) || false
        const findOriginalPhoto = photoItem.other_photo_version.find(photoItem => photoItem.version === 'original_photo')
        photoItem.path = findOriginalPhoto ? findOriginalPhoto.path : ''
        if (photoItem.isJoint) {
          photoItem.jointClass = photoItem.tags.values.splice_mark
          photoItem.jointClassNum = photoItem.tags.values.splice_position
        }
      })
    })
    return msg
  })
}

/**
 * @description 更改流水信息【只能修改未审核通过流水】
 * @param {*} params
 */
export function modifyStream (params) {
  return axios({
    url: '/project_cloud/operator/modifyStream',
    method: 'PUT',
    data: params
  })
}

/**
 * @description 获取全部产品
 */
export function getAllProduct () {
  return axios({
    url: '/project_cloud/common/getAllProduct',
    method: 'get'
  })
}
