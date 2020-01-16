// retouchLeader
import axios from '@/plugins/axios.js'
import { keyToHump, transformPercentage, timeFormat, getAvg } from '@/utils/index.js'

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
    function getRateInfo (cardinal, sum) {
      return cardinal + ' / ' + transformPercentage(cardinal, sum)
    }
    const data = keyToHump(msg)
    const avgTime = data.retouchTimeAvg
    const streamCount = parseInt(data.finishStreamNum)
    const photoCount = parseInt(data.finishPhotoNum)
    for (const key in data.income) {
      data.income[key] = Number(data.income[key])
    }
    const income = data.income.retouch + data.income.impulse + data.income.reward - data.income.punish
    data.spotCheckNonePhotoNum = data.spotCheckPhotoNum - data.spotCheckPlantPhotoNum - data.spotCheckPullPhotoNum
    const createData = {}
    createData.finishStreamNum = parseInt(data.finishStreamNum) // 修图单量
    createData.finishPhotoNum = parseInt(data.finishPhotoNum) // 修图张数
    createData.reworkStreamNum = parseInt(data.reworkStreamNum) // 重修次数
    createData.overTimeStreamNum = parseInt(data.overTimeStreamNum) // 超时单量
    createData.lekimaInfo = parseInt(data.lichmaStreamNum) + ' / ' + parseInt(data.lichmaPhotoNum)
    const retouchTime = Number(avgTime.rebuildTime.sum) + Number(avgTime.retouchTime.sum)
    let avgRetouchTimeStream = getAvg(retouchTime, streamCount)
    let avgRetouchTimePhoto = getAvg(retouchTime, photoCount)
    avgRetouchTimeStream = timeFormat(avgRetouchTimeStream, 'text', true)
    avgRetouchTimePhoto = timeFormat(avgRetouchTimePhoto, 'text', true)
    createData.avgRetouchTime = [`${avgRetouchTimeStream}(单)`, `${avgRetouchTimePhoto}(张)`]
    createData.income = income.toFixed(2) // 收益
    createData.notReachStandardDays = data.notReachStandardDays // 未完成指标（天）
    createData.reviewPlantInfo = getRateInfo(data.reviewPlantPhotoNum, photoCount) // 审核种草 / 种草率
    createData.reviewPullInfo = getRateInfo(data.reviewPullPhotoNum, photoCount) // 审核拔草 / 拔草率
    createData.spotCheckPlantInfo = getRateInfo(data.spotCheckPlantPhotoNum, data.spotCheckPhotoNum) // 抽查种草 / 种草率
    createData.spotCheckPullInfo = getRateInfo(data.spotCheckPullPhotoNum, data.spotCheckPhotoNum) // 抽查拔草 / 拔草率
    createData.spotCheckNoneInfo = getRateInfo(data.spotCheckNonePhotoNum, data.spotCheckPhotoNum) // 抽查通过 / 直接通过率
    return createData
  })
}

/**
 * @description 获取组员对比数据
 */
export function getStaffQuotaInfoGroupByStaff (params) {
  return axios({
    url: '/project_cloud/retouchLeader/getStaffQuotaInfoGroupByStaff',
    method: 'GET',
    params
  }).then(data => {
    const createData = []
    for (const staffInfoKey in data) {
      const staffInfoItem = data[staffInfoKey]
      const createItem = {}
      const retouchAllTime = Number(staffInfoItem.retouchTimeAvg.rebuildTime.sum) + Number(staffInfoItem.retouchTimeAvg.retouchTime.sum)
      const retouchPhotoCount = parseInt(staffInfoItem.finishPhotoNum)
      createItem.name = staffInfoItem.nickname || staffInfoItem.name || '暂无'
      createItem.finishPhotoNum = retouchPhotoCount // 完成张数
      const retouchAvgTimeSec = getAvg(retouchAllTime, retouchPhotoCount)
      createItem.retouchAvgTime = (retouchAvgTimeSec / 60).toFixed(2) // 平均修图时间
      createItem.lekimaCount = parseInt(staffInfoItem.lichmaPhotoNum) // 利奇马张数
      createItem.reviewPlantPhotoNum = parseInt(staffInfoItem.reviewPlantPhotoNum) // 审核种草数
      createItem.reviewPullPhotoNum = parseInt(staffInfoItem.reviewPullPhotoNum) // 审核报草数
      createData.push(createItem)
    }
    return createData
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
      listItem.retoucherName = listItem.retoucher && (listItem.retoucher.name || listItem.retoucher.real_name) || '-'
      listItem.retouchAllTime = timeFormat(allTime, 'text', true)
      listItem.reviewPhoto = reviewPlantPhotoNum + ' / ' + reviewPullPhotoNum
      listItem.checkPhoto = spotPlantPhotoNum + ' / ' + spotPullPhotoNum
      listItem.lekimaInfo = listItem.tags && listItem.tags.values && listItem.tags.values.lichma_photo_num || '-'
      const storeGrade = listItem.tags && listItem.tags.values && listItem.tags.values.store_star || '-'
      const npsGrade = listItem.tags && listItem.tags.values && listItem.tags.values.retoucher_score || '-'
      listItem.gradeInfo = { storeGrade, npsGrade }
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
