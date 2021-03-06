import axios from '@/plugins/axios.js'
import TargetModel from '@/model/TargetModel'
import { STAFF_LEVEL } from '@/utils/enumerate'
import { keyToHump, getAvg } from '@/utils/index.js'
import * as MathUtil from '@/utils/mathUtil'

/**
 * @description 获取个人今日指标
 */
export function getSelfQuota () {
  return axios({
    url: '/project_cloud_oa/retoucher/getSelfQuota',
    method: 'get'
  }).then(msg => {
    const data = keyToHump(msg)
    for (const key in data.todayIncome) {
      data.todayIncome[key] = Number(data.todayIncome[key])
    }

    const punishExp = Number(_.get(data, 'todayExp.punish') || 0) // 惩罚海草
    const retouchExp = Number(_.get(data, 'todayExp.retouch') || 0) // 今日已修海草
    const timeIntervalRewardExp = Number(_.get(data, 'todayExp.timeIntervalReward') || 0) // 今日时段奖励海草
    const overTimePunishExp = Number(_.get(data, 'todayExp.overTimePunish') || 0) // 超时扣除海草
    const rollbackNormalExp = Number(_.get(data, 'todayExp.rollback_normal') || 0) // c流水退单回滚海草值
    const rollbackReturnExp = Number(_.get(data, 'todayExp.rollback_return') || 0) // r流水退单回滚海草值
    const rollbackExpRework = rollbackNormalExp + rollbackReturnExp // 退单回滚海草值
    const rollbackExpOvertime = Number(_.get(data, 'todayExp.rollback_overtime') || 0) // 沙漏回滚海草值
    const todayExp = retouchExp + timeIntervalRewardExp - overTimePunishExp // 今日最终海草

    data.todayPunishExp = punishExp.toFixed(2) // 退回扣除海草
    data.overTimePunishExp = overTimePunishExp.toFixed(2) // 超时扣除海草
    data.rollbackExpRework = rollbackExpRework.toFixed(2) // 退单回滚的海草值
    data.rollbackExpOvertime = rollbackExpOvertime.toFixed(2) // 沙漏回滚的海草值
    data.todayExp = todayExp.toFixed(2) // 今日最终海草

    const incomePunish = _.get(data, 'todayIncome.punish') || 0 // 惩罚金额
    const incomeOverTimePunish = _.get(data, 'todayIncome.overTimePunish') || 0 // 超时惩罚金额
    const retouchIncome = _.get(data, 'todayIncome.retouch') || 0 // 今日修图收益
    const impulseIncome = _.get(data, 'todayIncome.impulse') || 0 // 今日冲量奖励收益
    const timeIntervalRewardIncome = _.get(data, 'todayIncome.timeIntervalReward') || 0 // 今日时段奖励收益
    const timeIntervalImpulseIncome = _.get(data, 'todayIncome.timeIntervalImpulse') || 0 // 今日时段冲量奖励收益
    const rewardIncome = _.get(data, 'todayIncome.reward') || 0 // 今日奖励收益
    const rollbackNormalIncome = Number(_.get(data, 'todayIncome.rollback_normal') || 0) // c流水回滚收益
    const rollbackReturnIncome = Number(_.get(data, 'todayIncome.rollback_return') || 0) // r流水回滚收益
    const rollbackOvertimeIncome = Number(_.get(data, 'todayIncome.rollback_overtime') || 0) // 沙漏回滚收益
    const rollbackIncomeRework = rollbackNormalIncome + rollbackReturnIncome // 退单回滚收益
    const rollbackIncomeOvertime = rollbackOvertimeIncome // 沙漏回滚收益

    // 获取今日收益
    const todayIncome = MathUtil.summation()
    todayIncome(retouchIncome)
    todayIncome(impulseIncome)
    todayIncome(timeIntervalRewardIncome)
    todayIncome(timeIntervalImpulseIncome)
    todayIncome(rewardIncome)
    todayIncome(-1 * incomePunish)
    todayIncome(-1 * incomeOverTimePunish)
    todayIncome(rollbackIncomeRework)
    todayIncome(rollbackIncomeOvertime)
    data.todayRewordIncome = todayIncome.toResult()
    
    const punishIncome = incomePunish + incomeOverTimePunish
    data.punishIncome = punishIncome.toFixed(2)
    data.rollbackIncomeRework = rollbackIncomeRework.toFixed(2)
    data.rollbackIncomeOvertime = rollbackIncomeOvertime.toFixed(2)

    // 获取修图总量
    data.todayFinishNormalPhotoNum = Number(data.todayFinishPhotoNum.normal) || 0
    data.todayFinishReworkPhotoNum = Number(data.todayFinishPhotoNum.rework) || 0
    
    // 抵扣张数
    data.deductionPhotoCount = Number(_.get(data, 'todayTargetPhotoNum.weight_increase_num') || 0)

    // 今日完成总量
    // 实际完成
    const finishNum = Number(_.get(data, 'todayTargetPhotoNum.finish_num') || 0)
    const todayAllFinishPhotoNum = MathUtil.summation()
    todayAllFinishPhotoNum(finishNum)
    todayAllFinishPhotoNum(data.deductionPhotoCount)
    data.todayAllFinishPhotoNum = todayAllFinishPhotoNum.toResult()

    // 目标值
    const baseTargetPhotoNum = Number(_.get(data, 'todayTargetPhotoNum.base_goal_num') || 0)
    data.baseTargetPhotoNum = baseTargetPhotoNum
    // 浮动张数
    const predictFloatPhotoNum = Number(_.get(data, 'todayTargetPhotoNum.expect_float_num') || 0)
    data.predictFloatPhotoNum = predictFloatPhotoNum
    // 请假减少
    const vacateReducePhotoNum = Number(_.get(data, 'todayTargetPhotoNum.leave_decrease_num') || 0)
    data.vacateReducePhotoNum = vacateReducePhotoNum

    const todayTargetPhotoNum = MathUtil.summation()
    todayTargetPhotoNum(data.baseTargetPhotoNum)
    todayTargetPhotoNum(data.predictFloatPhotoNum)
    todayTargetPhotoNum(-1 * data.vacateReducePhotoNum)
    data.todayTargetPhotoNum = todayTargetPhotoNum.toResult()
    data.todayTargetPhotoNum = data.todayTargetPhotoNum <= 0 ? 0 : data.todayTargetPhotoNum

    const todayFinishPhotoNumProgress = getAvg(data.todayAllFinishPhotoNum, data.todayTargetPhotoNum)
    data.todayFinishPhotoNumProgress = data.todayTargetPhotoNum === 0 ? 100 : todayFinishPhotoNumProgress * 100
    return data
  })
}

/**
 * @description 获取个人今日指标
 */
export function getSelfBuffInfo () {
  return axios({
    url: '/project_cloud/retoucher/getSelfBuffInfo',
    method: 'GET'
  }).then(msg => {
    const data = keyToHump(msg)
    data.impulseInfo = []

    data.impulse = (data.impulse && data.impulse.state === 'using') ? data.impulse : {}
    if (Object.keys(data.impulse).length) {
      const creatImpulse = data.impulse.impulse_setting_item.map(item => {
        return {
          reachExp: item.reach_exp,
          reward: item.reward
        }
      })
      data.impulseInfo = [...data.impulseInfo, ...creatImpulse]
    }
    if (data.extraImpulse && Object.keys(data.extraImpulse).length) {
      const createExtraImpulseInfo = data.extraImpulse.items.map(item => {
        return {
          reachExp: item.exp,
          reward: item.reward
        }
      })
      data.impulseInfo = [...data.impulseInfo, ...createExtraImpulseInfo]
    }
    data.impulseStatus = Boolean(data.impulseInfo.length)
    return data
  })
}

/**
 * @description 获取个人等级
 */
export function getRankInfo () {
  return axios({
    url: '/project_cloud/staff/getLevelInfo',
    method: 'POST'
  }).then(msg => {
    const createData = {
      level: msg.level,
      levelName: STAFF_LEVEL[msg.level] || '-',
      exp: Number(msg.exp),
      staffLevelCheck: msg.staff_level_check || {}
    }
    return createData
  })
}

/**
 * @description 获取修图绩效
 * @param {*} params
 */
export function getRetouchQuota (params) {
  return axios({
    url: '/project_cloud_oa/retoucher/getRetouchQuota',
    method: 'GET',
    params
  }).then(msg => {
    const createData = new TargetModel(msg)
    return {
      list: [createData],
      notReachStandardDays: createData.notReachStandardDays
    }
  })
}

/**
 * @description 获取小蜜蜂奖励
 * @param {*} params
 */
export function getLittleBeeInfo (params) {
  return axios({
    url: '/project_cloud/retoucher/getLittleBeeInfo',
    method: 'GET',
    params
  }).then(msg => {
    const data = keyToHump(msg)
    const createData = [{
      label: '金额',
      value: `¥${data.bonus}` || '-'
    }, {
      label: '绩效平均分',
      value: Number(data.avgKpi).toFixed(2) || '-'
    }, {
      label: '排名',
      value: data.rank || '-'
    }]
    return createData
  })
}

/**
 * @description 获取道具列表
 * @param {*} params
 */
export function getProps () {
  return axios({
    url: '/project_cloud/retoucher/getProps',
    method: 'GET'
  }).then(msg => {
    const data = msg.filter(item => item.state === 'unused')
    const descObj = {
      'exp': {
        className: 'iconmap-experience-icon',
        multipleText: '倍经验翻倍'
      },
      'gold_reward': {
        className: 'iconmap-gold-icon',
        multipleText: '倍收益奖励'
      }
    }
    const createData = {}
    data.forEach(cardItem => {
      const cardType = cardItem.card.type
      const cardMultiple = cardItem.card.multiple
      const key = cardType + cardMultiple
      if (createData[key]) {
        createData[key].count++
        const itemEndTime = new Date(cardItem.end_at).getTime()
        if (itemEndTime < createData[key].endAt) {
          createData[key].endAt = itemEndTime
          createData[key].id = cardItem.id
        }
      } else {
        createData[key] = {
          id: cardItem.id,
          endAt: new Date(cardItem.end_at).getTime(),
          className: descObj[cardType].className,
          multiple: cardItem.card.multiple,
          multipleText: descObj[cardType].multipleText,
          count: 1,
          showProp: false
        }
      }
      cardItem.className = descObj[cardType].className
      cardItem.multipleText = descObj[cardType].multipleText
    })
    return createData
  })
}

/**
 * @description 使用道具
 * @param {*} params
 */
export function useProp (params) {
  return axios({
    url: '/project_cloud/retoucher/useProp',
    method: 'PUT',
    data: params
  })
}

/**
 * @description 是否有退回订单
 * @param {*} params
 */
export function haveReworkStream () {
  return axios({
    url: '/project_cloud/retoucher/haveReworkStream',
    method: 'GET'
  }).then(msg => {
    if (!Object.values(msg).length) return []
    const returnType = ['review_return_retouch', 'store_return_retouch']
    let createData = []
    returnType.forEach(type => {
      if (msg[type]) {
        const data = msg[type].map(returnMsg => {
          return { streamId: returnMsg, type }
        })
        createData = [...createData, ...data]
      }
    })
    return createData
  })
}

/**
 * @description 上线功能
 * @param {*} params
 */
export function changeOnline () {
  return axios({
    url: '/project_cloud/retoucher/online',
    method: 'PUT'
  })
}

/**
 * @description 下线功能
 */
export function changeOffline (params) {
  const data = params || { action: 'self' }
  return axios({
    url: '/project_cloud/retoucher/offline',
    method: 'PUT',
    data
  })
}

export function getOnlineState () {
  return axios({
    url: '/project_cloud/retoucher/getOnlineState',
    method: 'GET'
  })
}
