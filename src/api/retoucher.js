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
    const todayIncome = Number(data.todayIncome.retouch) + Number(data.todayIncome.impulse)
    data.todayIncome = todayIncome.toFixed(2)
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
    return keyToHump(msg)
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
    createData.nearly30DaysPlantRate = Math.floor(createData.nearly30DaysPlantRate * 100)
    createData.nearly30DaysPullRate = Math.floor(createData.nearly30DaysPullRate * 100)
    createData.needLevelUpPhotoPlantRate = Math.floor(createData.needLevelUpPhotoPlantRate * 100)
    createData.needLevelUpPhotoPullRate = Math.floor(createData.needLevelUpPhotoPullRate * 100)
    console.log(createData)
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
    console.log(data)
    const avgTime = data.avgRetouchAndRebuildTime
    const avgRetouchTime = getAvg(avgTime.retouchTime.sum, avgTime.retouchTime.count)
    const avgRebuildTime = getAvg(avgTime.rebuildTime.sum, avgTime.rebuildTime.count)
    const createData = [
      {
        label: '修图单量/张数',
        value: data.retouchStreamNum + ' / ' + data.retouchPhotoNum,
        link: '/retoucher-center/retouch-history'
      }, {
        label: '修图平均用时',
        value: timeFormat((avgRetouchTime + avgRebuildTime), 'text', true)
      }, {
        label: '种草量/种草率',
        value: data.plantNum + ' / ' + transformPercentage(data.plantNum, data.retouchPhotoNum),
        link: '/retoucher-center/retouch-history'
      }, {
        label: '拔草量/拔草率',
        value: data.pullNum + ' / ' + transformPercentage(data.pullNum, data.retouchPhotoNum),
        link: '/retoucher-center/retouch-history'
      }, {
        label: '超时单量',
        value: data.overNum,
        link: '/retoucher-center/retouch-history'
      }, {
        label: '修图获得收益',
        value: data.retouchIncome
      }, {
        label: '奖励收益',
        value: data.rewardIncome
      }, {
        label: '获得海草',
        value: data.exp
      }
    ]
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
    data.forEach(cardItem => {
      if (cardItem.card.type === 'exp') {
        cardItem.className = 'iconmap-experience-icon'
        cardItem.multipleText = '倍经验翻倍'
      } else {
        cardItem.className = 'iconmap-gold-icon'
        cardItem.multipleText = '倍收益奖励'
      }
    })
    return data
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
    if (msg.length) return msg[0]
    return null
  })
}
