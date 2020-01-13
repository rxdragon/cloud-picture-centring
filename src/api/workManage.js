import axios from '@/plugins/axios.js'
import { keyToHump, transformPercentage, isObj, getAvg, timeFormat } from '@/utils'
import { isNumber } from '@/utils/validate'

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
    msg.retouchSinglePhotoNum = Number(msg.retouchSinglePhotoNum) // 单人修图张数
    msg.retouchMultiPhotoNum = Number(msg.retouchMultiPhotoNum) // 多人修图张数
    msg.income = Number(msg.income.impulse) + Number(msg.income.retouch) + Number(msg.income.reward)// 收益
    const reviewCount = Number(msg.retoucherFinishPhotoNum) // 修图张数
    msg.reviewPlantRate = getAvg(msg.reviewPlant, reviewCount) // 审核种草数量
    msg.reviewPullRate = getAvg(msg.reviewPull, reviewCount) // 审核拔草数量
    const evaluatedCount = Number(msg.retoucherEvaluatedNum) // 抽查总数
    msg.retoucherEvaluatedPlantRate = getAvg(msg.retoucherEvaluatedPlantNum, evaluatedCount) // 抽查种草率
    msg.retoucherEvaluatedPullRate = getAvg(msg.retoucherEvaluatedPullNum, evaluatedCount) // 抽查拔草率
    msg.retoucherEvaluatedNoPlantNoPullRate = getAvg(msg.retoucherEvaluatedNoPlantNoPullNum, evaluatedCount) // 直接通过率
    const retoucherNpsCount = Number(msg.retoucherNpsScore.count) // nps总量
    msg.retoucherNpsAvg = getAvg(msg.retoucherNpsScore.score, retoucherNpsCount) // 顾客满意度
    msg.storeEvaluateScoreAvg = getAvg(msg.storeEvaluateScoreAvg.sum, msg.storeEvaluateScoreAvg.count) // 门店评分
    msg.retouchReworkRate = getAvg(msg.retouchRework, msg.retoucherFinishStreamNum) // 重修率
    msg.overTimeStreamNum = parseInt(msg.overTimeStreamNum || 0) // 超时单量
    msg.storeReturnStreamNum = parseInt(msg.storeReturnStreamNum || 0) // 门店退单
    msg.storeReturnStreamNumForQuality = parseInt(msg.storeReturnStreamNumForQuality || 0) // 门店退单（非质量问题）
    msg.storeReturnPhotoNumForQuality = parseInt(msg.storeReturnPhotoNumForQuality || 0) // 门店退单（非质量问题）张数
    msg.storeReturnStreamNumForNotQuality = parseInt(msg.storeReturnStreamNumForNotQuality || 0) // 门店退单（质量问题）
    msg.storeReturnPhotoNumForNotQuality = parseInt(msg.storeReturnPhotoNumForNotQuality || 0) // 门店退单（质量问题）张数
    msg.lekimaStreamNum = parseInt(msg.lichmaStreamNum || 0) // 利奇马张数
    msg.lekimaPhotoNum = parseInt(msg.lichmaPhotoNum || 0) // 利奇马单数
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
    const createData = {}
    function toParseIntName (arg) {
      for (const key in arg) {
        const item = arg[key]
        if (isNumber(item)) {
          arg[key] = parseInt(item)
        } else if (isObj(item)) {
          toParseIntName(item)
        }
      }
    }
    toParseIntName(data)
    createData.photographyUploadPhotoNum = data.photographyUploadPhotoNum // 摄影上传张数
    createData.photographOrgUploadStreamNum = data.photographOrgUploadStreamNum // 摄影上传单数
    const allRetouchPhoto = {
      single: data.cloudRetouchPhotoNum.single + data.outerRetouchPhotoNum.single,
      multi: data.cloudRetouchPhotoNum.multi + data.outerRetouchPhotoNum.multi
    }
    createData.allRetouchPhoto = allRetouchPhoto // 总已修张数
    createData.allRetouchPhotoStream = data.retoucherFinishStreamNum + data.outerRetouchStreamNum
    createData.cloudRetouchPhotoNum = data.cloudRetouchPhotoNum // 云端已修照片
    createData.cloudRetouchPhotoStream = data.retoucherFinishStreamNum // 云端已修单量
    createData.outerRetouchPhotoNum = data.outerRetouchPhotoNum // 外包已修张数
    createData.outerRetouchStreamNum = data.outerRetouchStreamNum // 外包已修单量
    createData.templatePhotoNum = data.templatePhotoNum // 模版照
    createData.reworkRate = getAvg(data.retoucherReworkStreamNum, data.retoucherFinishStreamNum) * 100 // 重修率
    return createData
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
      review_stream_num: parseInt(data.reviewStreamNum),
      review_photo_num: parseInt(data.reviewPhotoNum),
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
  }).then(msg => {
    const data = keyToHump(msg)
    const createData = {}
    for (const key in data) {
      if (key !== 'retouchTimeAvg') {
        createData[key] = getAvg(data[key].sum * 1000, data[key].count)
      }
    }
    const retouchTime = Number(data.retouchTimeAvg.rebuildTime.sum) + Number(data.retouchTimeAvg.retouchTime.sum)
    const outerRetouchTime = Number(data.outerRetouchTimeAvg.sum)
    const allRetouchTime = outerRetouchTime + retouchTime
    const retouchCount = Number(data.retouchTimeAvg.retouchTime.count)
    const outerRetouchCount = Number(data.outerRetouchTimeAvg.count)
    const allRetouchCount = retouchCount + outerRetouchCount
    createData['retouchTimeAvg'] = getAvg(retouchTime * 1000, retouchCount)
    createData['retouchAllTimeAvg'] = getAvg(allRetouchTime * 1000, allRetouchCount)
    const returnCount = Number(data.retouchTimeAvg.rebuildTime.count)
    const returnTime = Number(data.retouchTimeAvg.rebuildTime.sum)
    createData['returnToRebuildTime'] = getAvg(returnTime * 1000, returnCount)
    return createData
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
  }).then(msg => {
    msg.list.forEach(listItem => {
      listItem.retoucherName = listItem.stream.retoucher && (listItem.stream.retoucher.name || listItem.stream.retoucher.real_name) || '-'
      listItem.retouchGroupName = listItem.stream.retoucher && listItem.stream.retoucher.retouch_group && listItem.stream.retoucher.retouch_group.name || '-'
      listItem.retoucherNpsAvg = listItem.stream.tags && listItem.stream.tags.values && listItem.stream.tags.values.retoucher_score || '-'
    })
    return msg
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
      listItem.product = listItem.product || { id: '' }
      listItem.photos.forEach(photoItem => {
        photoItem.isDelete = listItem.isOperatorDeletedStream || false
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
