import axios from '@/plugins/axios.js'
import PerformanceModel from '@/model/PerformanceModel.js'

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
export function getStaffPerformance (params) {
  return axios({
    url: '/project_cloud/staff/getStaffScores',
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
export function batchSaveStaffScores (params) {
  return axios({
    url: '/project_cloud/staff/batchSaveStaffScores',
    method: 'POST',
    data: params
  })
}

/**
 * @description 编辑分数
 * @param { String } type retoucher 组员 retoucherLeader 组管
 */
export function editStaffScore (params) {
  return axios({
    url: '/project_cloud/staff/editStaffScore',
    method: 'PUT',
    data: params
  })
}

/**
 * @description 编辑分数
 * @param { String } type retoucher 组员 retoucherLeader 组管
 */
export function getGroupScoreRanks (params) {
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
