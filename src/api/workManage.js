/* eslint-disable max-len */

import axios from '@/plugins/axios.js'
import { RETOUCH_STANDARD } from '@/utils/enumerate'
import { keyToHump, transformPercentage, isObj, getAvg, timeFormat } from '@/utils'
import { toFixed, isNumber } from '@/utils/validate'
import * as MathUtil from '@/utils/mathUtil'

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
    // 计算收益
    for (const key in msg.income) {
      msg.income[key] = Number(msg.income[key])
    }

    // R流水收益
    const returnIncomeFun = MathUtil.summation()
    returnIncomeFun(msg.income.storeReturnIncomeForBoth)
    returnIncomeFun(msg.income.storeReturnIncomeForNotQuality)
    returnIncomeFun(msg.income.storeReturnIncomeForQuality)
    msg.income.returnIncome = returnIncomeFun.toResult()

    // 退单回补收益
    const rollbackIncomeReworkFun = MathUtil.summation()
    rollbackIncomeReworkFun(msg.income.rollbackForNormalRework)
    rollbackIncomeReworkFun(msg.income.rollbackForReturnRework)
    const rollbackIncomeRework = rollbackIncomeReworkFun.toResult()

    const rollbackIncomeOvertime = Number(msg.income.rollbackForOvertime || 0)

    msg.income.rollbackIncomeRework = rollbackIncomeRework
    msg.income.rollbackIncomeOvertime = MathUtil.toFixed(rollbackIncomeOvertime)

    // 时段奖励收益
    msg.income.timeIntervalImpulse = MathUtil.toFixed(_.get(msg, 'income.timeIntervalImpulse') || 0)
    msg.income.timeIntervalReward = MathUtil.toFixed(_.get(msg, 'income.timeIntervalReward') || 0)

    // 收益
    const incomeFun = MathUtil.summation()
    incomeFun(msg.income.retouch)
    incomeFun(msg.income.impulse)
    incomeFun(msg.income.reward)
    incomeFun(rollbackIncomeRework)
    incomeFun(rollbackIncomeOvertime)
    incomeFun(msg.income.returnIncome)
    incomeFun(msg.income.timeIntervalImpulse)
    incomeFun(msg.income.timeIntervalReward)
    incomeFun(-1 * (msg.income.punish))
    incomeFun(-1 * (msg.income.glassPunishIncome))
    msg.incomeInfo = incomeFun.toResult()

    // 惩罚海草
    const returnExpFun = MathUtil.summation()
    returnExpFun(msg.exp.storeReturnExpForBoth)
    returnExpFun(msg.exp.storeReturnExpForNotQuality)
    returnExpFun(msg.exp.storeReturnExpForQuality)
    msg.exp.returnExp = returnExpFun.toResult()

    const rollbackExpReworkFun = MathUtil.summation()
    rollbackExpReworkFun(msg.exp.rollbackForNormalRework)
    rollbackExpReworkFun(msg.exp.rollbackForReturnRework)
    const rollbackExpRework = rollbackExpReworkFun.toResult()
    
    const rollbackExpOvertime = Number(msg.exp.rollbackForOvertime)

    msg.exp.rollbackExpRework = rollbackExpRework
    msg.exp.rollbackExpOvertime = MathUtil.toFixed(rollbackExpOvertime)
    msg.exp.timeIntervalReward = Number(_.get(msg, 'exp.timeIntervalReward') || 0) // 时段海草奖励

    // 海草
    const expFun = MathUtil.summation()
    expFun(msg.exp.normal)
    expFun(msg.exp.returnExp)
    expFun(msg.exp.timeIntervalReward)
    expFun(msg.exp.rollbackExpRework)
    expFun(msg.exp.rollbackExpOvertime)
    expFun(-1 * (msg.exp.punishExp))
    expFun(-1 * (msg.exp.glassPunishExp))
    msg.expInfo = expFun.toResult()

    // 顾客满意度
    const retoucherNpsCount = Number(msg.retoucherNpsScore.count) // nps总量
    msg.retoucherNpsAvg = getAvg(msg.retoucherNpsScore.sum, retoucherNpsCount) // 顾客满意度

    // 点赞点踩量
    const storeEvaluateCount = _.get(msg, 'storeEvaluateScoreAvg.count') || 0
    msg.goodStreamNum = parseInt(msg.goodNum || 0) // 门店点赞单量
    msg.goodRate = toFixed(getAvg(msg.goodStreamNum * 100, storeEvaluateCount)) // 门店点赞率
    msg.badStreamNum = parseInt(msg.badNum || 0) // 门店点踩量
    msg.badRate = toFixed(getAvg(msg.badStreamNum * 100, storeEvaluateCount)) // 门店点踩率

    msg.overTimeStreamNum = parseInt(msg.overTimeStreamNum || 0) - parseInt(msg.overTimeStreamRollbackNum || 0) // 超时单量
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
      createData[key] = getAvg(data[key].sum, data[key].count)
    }
    const retouchTime = Number(data.retouchTimeAvg.sum)
    const outerRetouchTime = Number(data.outerRetouchTimeAvg.sum)
    const allRetouchTime = outerRetouchTime + retouchTime
    const retouchCount = Number(data.retouchTimeAvg.count)
    const outerRetouchCount = Number(data.outerRetouchTimeAvg.count)
    const allRetouchCount = retouchCount + outerRetouchCount
    createData['retouchTimeAvg'] = getAvg(retouchTime, retouchCount)
    createData['retouchAllTimeAvg'] = getAvg(allRetouchTime, allRetouchCount)
    return Object.freeze(createData)
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
      const retoucher = _.get(listItem, 'stream.retoucher')
      const RetouchGroup = _.get(listItem, 'stream.retoucher.retouch_group')
      const RetouchGroupName = _.get(listItem, 'stream.retoucher.retouch_group.name')
      const tagsValues = _.get(listItem, 'stream.tags.values')
      listItem.retoucherName = retoucher ? listItem.stream.retoucher.name || listItem.stream.retoucher.real_name : '-'
      listItem.retouchGroupName = retoucher && RetouchGroup ? RetouchGroupName : '-'
      listItem.retoucherNpsAvg = tagsValues ? listItem.stream.tags.values.retoucher_score : '-'
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
        const tagsValues = _.get(photoItem, 'tags.values')
        photoItem.isDelete = listItem.isOperatorDeletedStream || false
        photoItem.isJoint = (tagsValues && Boolean(photoItem.tags.values.splice_mark)) || false
        const findOriginalPhoto = photoItem.other_photo_version.find(photoItem => {
          return photoItem.version === 'original_photo'
        })
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
    method: 'GET'
  })
}

/**
 * @description 获取修图标准时间信息
 * @param {*} params 
 */
export function getOrgStandardTimesQuota (params) {
  return axios({
    url: '/project_cloud/operator/getOrgStandardTimesQuota',
    method: 'GET',
    params
  }).then(msg => {
    const timeAvg = {
      [RETOUCH_STANDARD.BLUE]: {
        sum: 0,
        count: 0,
        avg: 0
      },
      [RETOUCH_STANDARD.MASTER]: {
        sum: 0,
        count: 0,
        avg: 0
      },
      [RETOUCH_STANDARD.KIDS]: {
        sum: 0,
        count: 0,
        avg: 0
      },
      [RETOUCH_STANDARD.MAINTO]: {
        sum: 0,
        count: 0,
        avg: 0
      }
    }
    msg.forEach(orgItem => {
      for (const type in orgItem) {
        timeAvg[type].sum += Number(orgItem[type].sum)
        timeAvg[type].count += Number(orgItem[type].count)
      }
    })
    for (const type in timeAvg) {
      timeAvg[type].avg = getAvg(timeAvg[type].sum, timeAvg[type].count)
    }
    return timeAvg
  })
}
