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
 * @param { String } type retoucher 组员 retoucherLeader 组管
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
 * @param { String } type retoucher 组员 retoucherLeader 组管
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
 * @param { String } type retoucher 组员 retoucherLeader 组管
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
 * @param { String } type retoucher 组员 retoucherLeader 组管
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
        leaderKpi: _.get(listItem, 'leader_score_info.leader_kpi_score') || '-',
        leaderKpiRank: _.get(listItem, 'leader_score_info.leader_kpi_rank') || '-'
      }
    })
    return createList
  })
}
