// retouchLeader
import axios from '@/plugins/axios.js'
import StreamModel from '@/model/StreamModel.js'
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
    // TODO 更改写入方式
    function getRateInfo (cardinal, sum) {
      return Number(cardinal) + ' / ' + transformPercentage(cardinal, sum)
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
    createData.income = income.toFixed(2) // 正常收益
    createData.notReachStandardDays = data.notReachStandardDays // 未完成指标（天）
    createData.goodEvaluationInfo = getRateInfo(data.goodStreamNum, streamCount) // 点赞数 / 点赞率
    createData.badEvaluationInfo = getRateInfo(data.badStreamNum, streamCount) // 点赞数 / 点赞率
    // TODO 缺少顾客满意度
    createData.npsEvaluate = getAvg(data.storeEvaluate.sum, data.storeEvaluate.count) // 点赞数 / 点赞率
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
      createItem.reviewPlantPhotoNum = parseInt(staffInfoItem.reviewPlantPhotoNum) // 审核种草数
      createItem.reviewPullPhotoNum = parseInt(staffInfoItem.reviewPullPhotoNum) // 审核报草数
      createItem.goodStreamNum = parseInt(staffInfoItem.goodStreamNum) // 点赞单量
      createItem.storeReturnStreamNum = parseInt(staffInfoItem.storeReturnStreamNum) // 门店退单
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
    method: 'POST',
    data: params
  }).then(msg => {
    msg.list = msg.list.map(item => {
      return {
        ...new StreamModel(item)
      }
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
 * @description 获取云学院报告问题照片
 * @param {*} params
 */
export function getStaffTProblemsPhotoList (params) {
  return axios({
    url: '/project_cloud/retouchLeader/getGroupStaffQuotaForCloudSchoolInfo',
    method: 'POST',
    params
  }).then(data => {
    const createData = []
    const evaluatePhotosNum = parseInt(data.evaluationPhotoNum)
    createData.push({ label: '评价照片量', value: evaluatePhotosNum, componentSwitch: true })
    const retoucherTagNum = data.retoucherTagNum.filter(item => Number(item.count))
    retoucherTagNum.forEach(tagItem => {
      const createTag = {
        label: `${tagItem.name}问题照片`,
        value: parseInt(tagItem.count),
      }
      createData.push(createTag)
    })
    const retouchScoreSum = _.get(data, 'retoucherScoreAvg.sum') || 0
    const retoucherScoreCount = _.get(data, 'retoucherScoreAvg.count') || 0
    const retoucherScoreAvg = getAvg(retouchScoreSum, retoucherScoreCount)
    createData.push({ label: '评价平均分', value: retoucherScoreAvg })
    return createData
  }).catch(() => {
    return {}
  })
}

/**
 * @description 获取云学院问题照片饼图
 * @param {*} params
 */
export function getStaffProblemReport (params) {
  return axios({
    url: '/project_cloud/retouchLeader/getGroupStaffQuotaForCloudSchoolInfoByStaff',
    method: 'POST',
    params
  }).then(data => {
    let sum = 0
    data = data.filter(item => item.count)
    const createData = data.map(labelItem => {
      labelItem.group.forEach(childItem => {
        childItem.count = parseInt(childItem.count)
      })
      sum = sum + Number(labelItem.count)
      return {
        name: labelItem.name,
        value: labelItem.count,
        group: labelItem.group
      }
    })
    createData.forEach(labelItem => {
      labelItem.rate = transformPercentage(labelItem.value, sum)
    })
    return createData
  }).catch(e => {
    console.error(e)
    return []
  })
}

/**
 * @description 获取学员平均分柱状图
 * @param {*} params
 */
export function getStaffAverageScore (params) {
  return axios({
    url: '/project_cloud/retouchLeader/getGroupStaffScoreForCloudSchoolInfoByStaff',
    method: 'POST',
    params
  }).then(data => {
    data.forEach(item => {
      item.avgScore = Number(item.avgScore).toFixed(2)
    })
    return data
  }).catch(() => {
    return []
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

/**
 * @description 修改组员工作量
 */
export function getLittleBeeInfo (params) {
  return axios({
    url: '/project_cloud/retouchLeader/getLittleBeeInfo',
    method: 'GET',
    params
  }).then(msg => {
    const data = keyToHump(msg)
    const createData = [{
      label: '奖励系数',
      value: `${data.rate}` || '-'
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
