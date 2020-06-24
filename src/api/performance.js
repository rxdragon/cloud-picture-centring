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
      const name = `${item.name}(${nickName})`
      return {
        name,
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
    url: '/project_cloud/staff/getSelfGroupStaffScores',
    method: 'PUT',
    data: params
  }).then(msg => {
    const createData = msg.map(item => {
      const performanceData = new PerformanceModel(item)
      const joinName = `${performanceData.name}(${performanceData.nickname})`
      return {
        joinName,
        ...performanceData
      }
    })
    return createData
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

