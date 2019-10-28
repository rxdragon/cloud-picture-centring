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
    data: params
  }).then(msg => {
    const data = keyToHump(msg)
    const avgTime = data.retouchTimeAvg
    const avgRetouchTime = getAvg(avgTime.retouchTime.sum, avgTime.retouchTime.count)
    const avgRebuildTime = getAvg(avgTime.rebuildTime.sum, avgTime.rebuildTime.count)
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
      value: data.income
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
    data: params
  }).then(msg => {
    msg.list.forEach(listItem => {
      const allTime = (listItem.retouch_time + listItem.review_return_rebuild_time) / 60
      listItem.retoucherName = listItem.retoucher.name
      listItem.retouchAllTime = allTime.toFixed(2) + 'min'
      listItem.reviewPhoto = listItem.review_plant_photo_num + ' / ' + listItem.review_pull_photo_num
      listItem.checkPhoto = listItem.spot_check_plant_photo_num + ' / ' + listItem.spot_check_pull_photo_num
    })
    console.log(msg)
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
