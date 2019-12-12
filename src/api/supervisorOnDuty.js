import axios from '@/plugins/axios.js'
import * as SessionTool from '@/utils/sessionTool.js'

/**
 * @description 获取设置值班主管
 */
export function getSupervisorOnDuty () {
  return axios({
    url: '/project_cloud/operator/getSupervisorOnDuty',
    method: 'GET'
  }).then(msg => {
    // TODO 处理今日数据
    const createData = {}
    msg.forEach(item => {
      const supervisorInfo = item.supervisor_info.map(infoItem => `${infoItem.id},${infoItem.name}`)
      createData[item.day_of_week] = supervisorInfo
    })
    console.log(createData)
    return createData
  })
}

/**
 * @description 获取全部主管
 */
export function getAllExecutive () {
  const data = SessionTool.getExecutiveList()
  function handelData (data) {
    const list = data.map(item => {
      const labelName = item.nickname || item.name
      return {
        label: labelName,
        value: `${item.id},${labelName}`
      }
    })
    return list
  }
  if (data) return handelData(data)
  return axios({
    url: '/project_cloud/common/getRetoucherLeaders',
    method: 'GET'
  }).then(msg => {
    SessionTool.setExecutiveList(msg)
    return handelData(msg)
  })
}

/**
 * @description 设置值班主管
 * @param {*} params
 */
export function setSupervisorOnDuty (params) {
  return axios({
    url: '/project_cloud/operator/setSupervisorOnDuty',
    method: 'POST',
    data: params
  })
}
