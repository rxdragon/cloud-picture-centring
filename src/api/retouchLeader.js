// retouchLeader
import axios from '@/plugins/axios.js'
import StreamModel from '@/model/StreamModel.js'
import { retouchStandardToCN } from '@/utils/enumerate'
import { keyToHump, transformPercentage, timeFormat, getAvg } from '@/utils/index.js'
import * as MathUtil from '@/utils/mathUtil'

/**
 * 组员的出勤状态
 */
const STAFF_WORK_STATUS = [
  {
    key: 'is_new_staff',
    name: '新人',
    type: 'dark'
  },
  {
    key: 'work_over_time',
    name: '加班',
    type: 'warning'
  },
  {
    key: 'leave_duration',
    name: '请假',
    type: 'danger'
  }
]

/**
 * @description 获取今日数据
 */
export function getTodayQuota () {
  return axios({
    url: '/project_cloud/retouchLeader/getTodayQuota',
    method: 'GET'
  }).then(msg => {
    const createData = keyToHump(msg)
    const { todayFinishedPhotoNum, todayExpectFinishPhotoNum } = createData
    if (!Number(createData.todayFinishedPhotoNum) || !Number(createData.todayExpectFinishPhotoNum)) {
      createData.todayFinishPhotoNumProgress = 0
    } else {
      createData.todayFinishPhotoNumProgress = Math.floor((todayFinishedPhotoNum / todayExpectFinishPhotoNum * 100), 0)
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
    url: '/project_cloud_oa/retouchLeader/getGroupStaffQuotaInfo',
    method: 'GET',
    params
  }).then(msg => {
    function getRateInfo (cardinal, sum) {
      return Number(cardinal) + ' / ' + transformPercentage(cardinal, sum)
    }
    const data = keyToHump(msg)
    const avgTime = data.retouchTimeAvg
    for (const key in data.income) {
      data.income[key] = Number(data.income[key])
    }

    data.spotCheckNonePhotoNum = data.spotCheckPhotoNum - data.spotCheckPlantPhotoNum - data.spotCheckPullPhotoNum
    const createData = {}
    createData.finishStreamNum = parseInt(data.finishStreamNum) // 修图单量
    createData.finishPhotoNum = parseInt(data.finishPhotoNum) // 修图张数
    createData.overTimeStreamNum = parseInt(data.overTimeStreamNum) // 超时单量
    createData.lekimaInfo = parseInt(data.lichmaStreamNum) + ' / ' + parseInt(data.lichmaPhotoNum)

    let avgRetouchTimeStream = getAvg(avgTime.retouchTime.sum, avgTime.retouchTime.count)
    let avgRetouchTimePhoto = getAvg(avgTime.retouchTimeForPhotoNum.sum, avgTime.retouchTimeForPhotoNum.count)
    avgRetouchTimeStream = timeFormat(avgRetouchTimeStream, 'text', true)
    avgRetouchTimePhoto = timeFormat(avgRetouchTimePhoto, 'text', true)

    createData.avgRetouchTime = [`${avgRetouchTimeStream}(单)`, `${avgRetouchTimePhoto}(张)`]

    const income = MathUtil.summation()
    income(data.income.retouch)
    income(data.income.impulse)
    income(data.income.reward)
    income(data.income.timeIntervalReward)
    income(data.income.timeIntervalImpulse)
    createData.income = income.toResult().toFixed(2) // 正常收益

    createData.notReachStandardDays = Number(data.notReachStandardDays) // 未完成指标（天）

    const storeEvaluateCount = _.get(data, 'storeEvaluate.count') || 0
    createData.goodEvaluationInfo = getRateInfo(data.goodStreamNum, storeEvaluateCount) // 点赞数 / 点赞率
    createData.badEvaluationInfo = getRateInfo(data.badStreamNum, storeEvaluateCount) // 点踩数 / 点踩率
    createData.npsEvaluate = getAvg(data.retoucherNpsScore.sum, data.retoucherNpsScore.count) // 顾客满意度
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
      const rebuildTimeSum = Number(_.get(staffInfoItem, 'retouchTimeAvg.rebuildTime.sum') || 0)
      const retouchTimeSum = Number(_.get(staffInfoItem, 'retouchTimeAvg.retouchTime.sum') || 0)
      const createItem = {}
      const retouchAllTime = rebuildTimeSum + retouchTimeSum
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

/**
 * @description 获取组员目标列表
 * @params { String } date
 */
export function getRetoucherGoalList (params) {
  return axios({
    url: '/project_cloud_oa/goal/retoucher/list',
    method: 'GET',
    params
  }).then(msg => {
    if (!msg && msg.length) return []
    msg.forEach(item => {
      item.retouchStandardCn = retouchStandardToCN[item.retouch_standard]
      item.achieveCn = msg.achieve ? '是' : '否'
      item.staff_schedule = item.staff_schedule || {}
      item.showExpectFloatNum = item.expect_float_num ? `${item.expect_float_num} 张/人` : '-'
      item.showActualFloatNum = item.actual_float_num ? `${item.actual_float_num} 张/人` : '-'
      item.tags = STAFF_WORK_STATUS.map(state => {
        const value = Number(_.get(item.staff_schedule, state.key))
        if (!value) return null
        if (state.key === 'leave_duration') {
          return Object.assign({}, state, { name: `请假：${value} 小时` })
        } else {
          return state
        }
      }).filter(state => Boolean(state))
    })
    return msg
  })
}


/**
 * @description 获取今日目标统计
 * @params { String }
 */
export function getRetoucherStatistical (params) {
  return axios({
    url: '/project_cloud_oa/goal/retoucher/total_num',
    method: 'GET',
    params
  }).then(msg => {
    return msg
  })
}


/**
 * @description 修改组员目标值
 * @params { String } date
 */
export function updateRetoucherGoal (params) {
  return axios({
    url: '/project_cloud_oa/goal/retoucher/edit',
    method: 'POST',
    data: params
  }).then(msg => {
    return msg
  })
}
