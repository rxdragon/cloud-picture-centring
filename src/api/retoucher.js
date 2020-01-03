import axios from '@/plugins/axios.js'
import { keyToHump, transformPercentage, getAvg, timeFormat } from '@/utils/index.js'

/**
 * @description 获取个人今日指标
 */
export function getSelfQuota () {
  return axios({
    url: '/project_cloud/retoucher/getSelfQuota',
    method: 'get'
  }).then(msg => {
    const data = keyToHump(msg)
    const todayIncome = Number(data.todayIncome.retouch) + Number(data.todayIncome.impulse) + Number(data.todayIncome.reward)
    data.todayIncome = todayIncome.toFixed(2)
    data.todayExp = Number(data.todayExp).toFixed(2)
    if (!Number(data.todayFinishPhotoNum) || !Number(data.todayTargetPhotoNum)) {
      data.todayFinishPhotoNumProgress = 0
    } else {
      data.todayFinishPhotoNumProgress = (data.todayFinishPhotoNum / data.todayTargetPhotoNum) * 100
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
    data.impulse = data.impulse.state === 'using' ? data.impulse : {}
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
    const data = keyToHump(msg)
    const avgTime = data.avgRetouchAndRebuildTime
    const avgRetouchTime = getAvg(avgTime.retouchTime.sum, avgTime.retouchTime.count)
    const avgRebuildTime = getAvg(avgTime.rebuildTime.sum, avgTime.rebuildTime.count)
    const rewardIncome = Number(data.rewardIncome.impulse) + Number(data.rewardIncome.reward)
    const createData = [{
      retouchNum: data.retouchStreamNum + ' / ' + data.retouchPhotoNum,
      avgRetouchTime: timeFormat((avgRetouchTime + avgRebuildTime), 'text', true),
      plantNum: data.plantNum + ' / ' + transformPercentage(data.plantNum, data.retouchPhotoNum),
      pullNum: data.pullNum + ' / ' + transformPercentage(data.pullNum, data.retouchPhotoNum),
      overNum: data.overNum,
      retouchIncome: {
        getIncome: Number(data.retouchIncome).toFixed(2),
        rewardIncome: rewardIncome.toFixed(2),
        // TODO 惩罚收益
        punishIncome: 0.00,
        actualIncome: (data.retouchIncome + rewardIncome - 0).toFixed(2)
      },
      exp: data.exp,
      lekimaCount: '0 / 0',
      // TODO 评分
      gradeInfo: {
        storeGrade: '9.99',
        npsGrade: '9.99'
      }
    }]
    return createData
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
      value: data.bonus
    }, {
      label: '排名',
      value: data.rank
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
