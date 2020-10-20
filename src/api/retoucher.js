import axios from '@/plugins/axios.js'
import TargetModel from '@/model/TargetModel'
import { keyToHump, getAvg } from '@/utils/index.js'

/**
 * @description 获取个人今日指标
 */
export function getSelfQuota () {
  return axios({
    url: '/project_cloud/retoucher/getSelfQuota',
    method: 'get'
  }).then(msg => {
    const data = keyToHump(msg)
    for (const key in data.todayIncome) {
      data.todayIncome[key] = Number(data.todayIncome[key])
    }

    const punishExp = Number(_.get(data, 'todayExp.punish') || 0) // 惩罚海草
    const retouchExp = Number(_.get(data, 'todayExp.retouch') || 0) // 今日已修海草
    const overTimePunishExp = Number(_.get(data, 'todayExp.overTimePunish') || 0) // 超时扣除海草
    const rollbackNormalExp = Number(_.get(data, 'todayExp.rollback_normal') || 0) // c流水回滚海草值
    const rollbackReturnExp = Number(_.get(data, 'todayExp.rollback_return') || 0) // r流水回滚海草值
    const rollbackExp = rollbackNormalExp + rollbackReturnExp// 回滚海草值
    const todayExp = retouchExp - overTimePunishExp // 今日最终海草

    data.todayPunishExp = punishExp.toFixed(2) // 退回扣除海草
    data.overTimePunishExp = overTimePunishExp.toFixed(2) // 超时扣除海草
    data.rollbackExp = rollbackExp.toFixed(2) // 回滚的海草值
    data.todayExp = todayExp.toFixed(2) // 今日最终海草

    const incomePunish = _.get(data, 'todayIncome.punish') || 0 // 惩罚金额
    const incomeOverTimePunish = _.get(data, 'todayIncome.overTimePunish') || 0 // 超时惩罚金额
    const retouchIncome = _.get(data, 'todayIncome.retouch') || 0 // 今日修图收益
    const impulseIncome = _.get(data, 'todayIncome.impulse') || 0 // 今日冲量奖励收益
    const rewardIncome = _.get(data, 'todayIncome.reward') || 0 // 今日奖励收益
    const rollbackNormalIncome = Number(_.get(data, 'todayIncome.rollback_normal') || 0) // c流水回滚收益
    const rollbackReturnIncome = Number(_.get(data, 'todayIncome.rollback_return') || 0) // r流水回滚收益
    const rollbackIncome = rollbackNormalIncome + rollbackReturnIncome // 回滚收益

    const todayIncome =
      retouchIncome +
      impulseIncome +
      rewardIncome -
      incomePunish -
      incomeOverTimePunish +
      rollbackIncome
    data.todayRewordIncome = todayIncome.toFixed(2)
    
    const punishIncome = incomePunish + incomeOverTimePunish
    data.punishIncome = punishIncome.toFixed(2)
    data.rollbackIncome = rollbackIncome.toFixed(2)

    // 获取修图总量
    data.todayFinishNormalPhotoNum = Number(data.todayFinishPhotoNum.normal) || 0
    data.todayFinishReworkPhotoNum = Number(data.todayFinishPhotoNum.rework) || 0
    const todayAllFinishPhotoNum = data.todayFinishNormalPhotoNum + data.todayFinishReworkPhotoNum
    data.todayAllFinishPhotoNum = todayAllFinishPhotoNum
    if (!todayAllFinishPhotoNum || !Number(data.todayTargetPhotoNum)) {
      data.todayFinishPhotoNumProgress = 0
    } else {
      data.todayFinishPhotoNumProgress = (todayAllFinishPhotoNum / data.todayTargetPhotoNum) * 100
    }
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
    url: '/project_cloud/retoucher/getRankInfo',
    method: 'GET'
  }).then(msg => {
    const createData = keyToHump(msg)
    createData.nearly30DaysGoodRate = Number((createData.nearly30DaysGoodRate * 100).toFixed(2))
    createData.nearly30DaysReturnRate = Number((createData.nearly30DaysReturnRate * 100).toFixed(2))
    createData.avgRetouchTime = getAvg(createData.retouchPhotoNumTimeSum, createData.retouchFinishPhotoNumCount * 60)
    createData.nearly30DaysPlantRate = (createData.nearly30DaysPlantRate * 100).toFixed(2)
    createData.nearlyPlantRate = Math.floor(createData.nearly30DaysPlantRate)
    createData.nearly30DaysPullRate = (createData.nearly30DaysPullRate * 100).toFixed(2)
    createData.nearlyPullRate = Math.floor(createData.nearly30DaysPullRate)
    createData.needLevelUpPhotoPlantRate = (createData.needLevelUpPhotoPlantRate * 100).toFixed(2)
    createData.needLevelUpPlantRate = Math.floor(createData.needLevelUpPhotoPlantRate)
    createData.needLevelUpPhotoPullRate = (createData.needLevelUpPhotoPullRate * 100).toFixed(2)
    createData.needLevelUpPullRate = Math.floor(createData.needLevelUpPhotoPullRate)
    return createData
  })
}

/**
 * @description 获取修图绩效
 * @param {*} params
 */
export function getRetouchQuota (params) {
  return axios({
    url: '/project_cloud/retoucher/getRetouchQuota',
    method: 'GET',
    params
  }).then(msg => {
    const createData = new TargetModel(msg)
    return [createData]
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
