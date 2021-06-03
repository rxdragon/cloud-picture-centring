import axios from '@/plugins/axios.js'
import PerformanceModel from '@/model/PerformanceModel.js'
import * as Validate from '@/utils/validate.js'

/**
 * @description 查询伙伴
 */
export function getCanScoreStaff (type) {
  const params = { type }
  return axios({
    url: '/project_cloud/staff/getCanScoreStaffs',
    method: 'POST',
    data: params
  }).then(msg => {
    const createData = msg.map(item => {
      const nickName = _.get(item, 'nickname') || '-'
      return {
        name: item.name,
        nickName,
        staffNum: item.id,
        score: ''
      }
    })
    return createData
  })
}

/**
 * @description 获取组员分数
 * @param { String } type retoucher 组员 retoucherLeader 组管
 */
export function getStaffPerformance (params, isSearchAll = false) {
  const url = isSearchAll
    ? '/project_cloud/operator/getStaffScores'
    : '/project_cloud/staff/getStaffScores'
  return axios({
    url,
    method: 'PUT',
    data: params
  }).then(msg => {
    const createData = msg.list.map(item => {
      const performanceData = new PerformanceModel(item)
      const joinName = `${performanceData.name}(${performanceData.nickname})`
      return {
        joinName,
        ...performanceData
      }
    })
    return {
      list: createData,
      total: msg.total
    }
  })
}

/**
 * @description 保存伙伴分数
 * @params { String } type retoucher 组员 retoucherLeader 组管
 */
export function batchSaveStaffScores (params, isSearchAll = false) {
  const url = isSearchAll
    ? '/project_cloud/operator/batchSaveStaffScores'
    : '/project_cloud/staff/batchSaveStaffScores'
  return axios({
    url,
    method: 'POST',
    data: params
  })
}

/**
 * @description 编辑分数
 * @params { String } type retoucher 组员 retoucherLeader 组管
 */
export function editStaffScore (params, isSearchAll = false) {
  const url = isSearchAll
    ? '/project_cloud/operator/editStaffScore'
    : '/project_cloud/staff/editStaffScore'
  return axios({
    url,
    method: 'PUT',
    data: params
  })
}

/**
 * @description 编辑分数
 * @params { String } type retoucher 组员 retoucherLeader 组管
 */
export function getGroupScoreRanks (params) {
  const groupId = params.groupId || ''
  delete params.groupId

  return axios({
    url: '/project_cloud/staff/getGroupScores',
    method: 'PUT',
    data: params
  }).then(msg => {
    const createList = msg.map(listItem => {
      const leaderName = _.get(listItem, 'leader_info.nickname') || ''
      const leaderNickName = _.get(listItem, 'leader_info.name') || ''
      if (!listItem) { listItem = {} }
      return {
        ...listItem,
        groupName: _.get(listItem, 'name') || '-',
        groupLeader: leaderNickName || leaderName || '-',
        groupLeaderJobNumber: _.get(listItem, 'leader_info.id') || '-',
        returnRate: Validate.toFixed(listItem.return_rate || 0),
        kpiScore: Validate.toFixed(listItem.leader_kpi_score || 0),
        averageScore: Validate.toFixed(listItem.average_score || 0)
      }
    })

    createList.sort((a, b) => b.kpiScore - a.kpiScore)
    createList.forEach((item, index) => {
      item.kpiScoreRank = index + 1
    })
    createList.sort((a, b) => b.averageScore - a.averageScore)
    createList.forEach((item, index) => {
      item.averageScoreRank = index + 1
    })
    createList.sort((a, b) => a.returnRate - b.returnRate)
    createList.forEach((item, index) => {
      item.returnRateRank = index + 1
    })

    // 如果查询修图组，前端过滤修图组
    if (groupId) {
      const filterGroupList = createList.filter(item => item.id === groupId)
      return filterGroupList
    }
    return createList
  })
}

/**
 * @description 编辑分数
 * @params { String } type retoucher 组员 retoucherLeader 组管
 */
export function getSelfGroupScoreRanks (params) {
  return axios({
    url: '/project_cloud/staff/getGroupScoreRanks',
    method: 'PUT',
    data: params
  }).then(msg => {
    const createList = msg.list.map(listItem => {
      const leaderName = _.get(listItem, 'group_info.leader_info.nickname') || ''
      const leaderNickName = _.get(listItem, 'group_info.leader_info.name') || ''
      return {
        ...listItem,
        groupName: _.get(listItem, 'group_info.name') || '-',
        groupLeader: leaderNickName || leaderName || '-',
        groupLeaderJobNumber: _.get(listItem, 'group_info.leader_info.id') || '-',
        leaderKpi: Validate.toFixed(listItem.leader_kpi_score) || '-',
        leaderKpiRank: _.get(listItem, 'leader_kpi_rank') || '-'
      }
    })
    return createList
  })
}

/**
 * @description 获取修图组目标
 * @params { String } date
 */
export function getRetoucherGoalList (params) {
  return axios({
    url: '/project_cloud_oa/achievement/retouchGroup/getPhotoNumGoalByDate',
    method: 'POST',
    data: params
  }).then(msg => {
    if (msg && msg.length) {
      msg.forEach(item => {
        item.groupName = _.get(item, 'group_info.name') || '-'
        item.leaderName = _.get(item, 'group_info.leader_info.nickname')
        item.leaderId = _.get(item, 'group_info.leader_info.id')
        item.showLaderName = item.leaderName ? `${item.leaderName} (${item.leaderId})` : '-'
        item.showExpectFloatNum = `${item.expect_float_num} 张/人`
        item.showActualFloatNum = `${item.actual_float_num} 张/人`
        item.isAchieve = item.achieve ? '是' : '否'
      })

      return msg
    }
    return []
  })
}

/**
 * @description 设置云端总体目标
 * @params { num, date }
 */
export function setOverallPhotoNumGoal (params) {
  return axios({
    url: '/project_cloud_oa/achievement/overall/photoNumGoal',
    method: 'POST',
    data: params
  }).then(msg => {
    return msg
  })
}

/**
 * @description 云端小组每日目标张数设定
 * @params { num, date，groupId }
 */
export function setGroupPhotoNumGoal (params) {
  return axios({
    url: '/project_cloud_oa/achievement/retouchGroup/photoNumGoal',
    method: 'POST',
    data: params
  }).then(msg => {
    return msg
  })
}

/**
 * @description 云端总体张数相关统计
 * @params { String } date
 */
export function getRetoucherGoalStatistics (params) {
  return axios({
    url: '/project_cloud_oa/achievement/overall/photoNumStatistics',
    method: 'POST',
    data: params
  }).then(msg => {
    return msg
  })
}
