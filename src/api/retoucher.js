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
    for (const key in data.todayIncome) {
      data.todayIncome[key] = Number(data.todayIncome[key])
    }
    data.punishExp = Number(data.todayExp.punish || 0).toFixed(2)
    data.todayExp = Number(data.todayExp.retouch || 0).toFixed(2)
    const todayIncome = data.todayIncome.retouch + data.todayIncome.impulse + data.todayIncome.reward
    data.todayRewordIncome = (todayIncome || 0).toFixed(2)
    data.punishIncome = (data.todayIncome.punish || 0).toFixed(2)
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
    createData.nearly30DaysGoodNum = createData.nearly30DaysGoodNum
    createData.nearly30DaysReturnNum = createData.nearly30DaysReturnNum
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
    const data = keyToHump(msg)
    const avgTime = data.avgRetouchAndRebuildTime
    const allRetouchTime = Number(avgTime.retouchTime.sum) + Number(avgTime.rebuildTime.sum)
    const avgRetouchTimeStream = getAvg(allRetouchTime, avgTime.retouchTime.count)
    const avgRetouchTimePhoto = getAvg(allRetouchTime, avgTime.retouchTimeForPhotoNum.count)
    const rewardIncome = Number(data.rewardIncome.impulse) + Number(data.rewardIncome.reward)
    const punishIncome = Number(data.rewardIncome.punishIncome)
    const retoucherNpsScoreAvg = getAvg(data.retoucherNpsScore.sum, data.retoucherNpsScore.count).toFixed(2)
    const punishExp = Number(_.get(data, 'exp.punishExp')) || 0
    const retouchExp = Number(_.get(data, 'exp.retouchExp')) || 0
    const createData = [{
      retouchNum: data.retouchStreamNum + ' / ' + data.retouchPhotoNum,
      avgRetouchTimeStream: timeFormat(avgRetouchTimeStream, 'text', true),
      avgRetouchTimePhoto: timeFormat(avgRetouchTimePhoto, 'text', true),
      goodNum: Number(data.goodNum) + ' / ' + transformPercentage(data.goodNum, data.retouchStreamNum),
      storeReturnNum: Number(data.storeReturnPhotoNumForQuality) + ' / ' + transformPercentage(data.storeReturnPhotoNumForQuality, data.retouchPhotoNum),
      overNum: data.overNum,
      retouchIncomeInfo: {
        getIncome: Number(data.retouchIncome).toFixed(2),
        rewardIncome: rewardIncome.toFixed(2),
        punishIncome: punishIncome.toFixed(2),
        actualIncome: (Number(data.retouchIncome) + rewardIncome - punishIncome).toFixed(2)
      },
      lekimaCount: parseInt(data.lichmaStreamNum) + ' / ' + parseInt(data.lichmaPhotoNum),
      gradeInfo: {
        npsGrade: retoucherNpsScoreAvg
      },
      streamNumForQuality: parseInt(data.storeReturnStreamNumForQuality),
      photoNumForQuality: parseInt(data.storeReturnStreamNum),
      exp: {
        punishExp: punishExp,
        retouchExp: retouchExp,
        rewordExp: retouchExp - punishExp
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
