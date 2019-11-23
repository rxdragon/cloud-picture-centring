// retouchLeader
import axios from '@/plugins/axios.js'
import { keyToHump, transformPercentage, timeFormat, getAvg } from '@/utils/index.js'
import { SearchType } from '@/utils/enumerate.js'

/**
 * @description 获取今日数据
 */
export function getTodayQuota () {
  return axios({
    url: '/project_cloud/retouchLeader/getTodayQuota',
    method: 'GET'
  }).then(msg => {
    const createData = keyToHump(msg)
    if (!Number(createData.todayFinishedPhotoNum) || !Number(createData.todayExpectFinishPhotoNum)) {
      createData.todayFinishPhotoNumProgress = 0
    } else {
      createData.todayFinishPhotoNumProgress = Math.floor((createData.todayFinishedPhotoNum / createData.todayExpectFinishPhotoNum * 100), 0)
    }
    return createData
  })
}

/**
 * @description 获取组员修图报告
 * @param {*} params
 */
export function getGroupStaffQuotaInfo (params) {
  return axios({
    url: '/project_cloud/retouchLeader/getGroupStaffQuotaInfo',
    method: 'GET',
    params
  }).then(msg => {
    const data = keyToHump(msg)
    const avgTime = data.retouchTimeAvg
    const avgRetouchTime = getAvg(avgTime.retouchTime.sum, avgTime.retouchTime.count)
    const avgRebuildTime = getAvg(avgTime.rebuildTime.sum, avgTime.rebuildTime.count)
    const income = Number(data.income.retouch) + Number(data.income.impulse)
    const tableDataCount = [{
      label: '修图单量',
      value: data.finishStreamNum,
      componentSwitch: true
    }, {
      label: '修图张数',
      value: data.finishPhotoNum
    }, {
      label: '重修次数',
      value: data.reworkStreamNum,
      componentSwitch: true
    }, {
      label: '超时单量',
      value: data.overTimeStreamNum,
      componentSwitch: true
    }, {
      label: '修图平均用时',
      value: timeFormat((avgRetouchTime + avgRebuildTime), 'text', true)
    }, {
      label: '收益',
      value: income.toFixed(2)
    }, {
      label: '未完成指标（天）',
      value: data.notReachStandardDays
    }]
    const tableDataRate = [{
      label: '审核种草 / 种草率',
      value: data.reviewPlantPhotoNum + ' / ' + transformPercentage(data.reviewPlantPhotoNum, data.finishPhotoNum),
      componentSwitch: true,
      query: SearchType.CheckPlant
    }, {
      label: '审核拔草 / 拔草率',
      value: data.reviewPullPhotoNum + ' / ' + transformPercentage(data.reviewPullPhotoNum, data.finishPhotoNum),
      componentSwitch: true,
      query: SearchType.CheckPull
    }, {
      label: '抽查种草 / 种草率',
      value: data.spotCheckPlantPhotoNum + ' / ' + transformPercentage(data.spotCheckPlantPhotoNum, data.spotCheckPhotoNum),
      componentSwitch: true,
      query: SearchType.SpotPlant
    }, {
      label: '抽查拔草 / 拔草率',
      value: data.spotCheckPullPhotoNum + ' / ' + transformPercentage(data.spotCheckPullPhotoNum, data.spotCheckPhotoNum),
      componentSwitch: true,
      query: SearchType.SpotPull
    }]
    return {
      tableDataCount,
      tableDataRate
    }
  })
}

/**
 * @description 获取组员修图记录
 * @param {*} params
 */
export function getStaffRetouchList (params) {
  return axios({
    url: '/project_cloud/retouchLeader/getStaffRetouchList',
    method: 'GET',
    params
  }).then(msg => {
    msg.list.forEach(listItem => {
      const reviewPlantPhotoNum = listItem.tags && listItem.tags.values && listItem.tags.values.plant_num || 0
      const reviewPullPhotoNum = listItem.tags && listItem.tags.values && listItem.tags.values.pull_num || 0
      const spotPlantPhotoNum = listItem.tags && listItem.tags.values && listItem.tags.values.film_evaluation_photo_plant_num || 0
      const spotPullPhotoNum = listItem.tags && listItem.tags.values && listItem.tags.values.film_evaluation_photo_pull_num || 0
      const allTime = (listItem.retouch_time + listItem.review_return_rebuild_time)
      listItem.retoucherName = listItem.retoucher && listItem.retoucher.name || listItem.retoucher.real_name || '-'
      listItem.retouchAllTime = timeFormat(allTime, 'text', true)
      listItem.reviewPhoto = reviewPlantPhotoNum + ' / ' + reviewPullPhotoNum
      listItem.checkPhoto = spotPlantPhotoNum + ' / ' + spotPullPhotoNum
    })
    return msg
  })
}

/**
 * @description 获取组员今日指标列表
 * @param {*} params
 */
export function getGroupStaffTodayQuotaList (params) {
  return axios({
    url: '/project_cloud/retouchLeader/getGroupStaffTodayQuotaList',
    method: 'GET',
    data: params
  }).then(msg => {
    const createData = []
    msg.forEach(item => {
      createData.push({
        name: item.name,
        staffId: item.id,
        retoucherClass: item.retoucher_class.name,
        entryMonths: item.entry_months,
        todayExceptPhotoNum: item.today_except_photo_num,
        todayFinishedPhotoNum: item.today_finished_photo_num,
        todaySuggestPhotoNum: item.today_suggest_photo_num
      })
    })
    return createData
  })
}

/**
 * @description 修改组员工作量
 */
export function changeGroupStaffWorkLoad (params) {
  return axios({
    url: '/project_cloud/retouchLeader/changeGroupStaffWorkLoad',
    method: 'PUT',
    data: params
  })
}
