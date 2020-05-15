import axios from '@/plugins/axios.js'

/**
 * @description 获取版本详情
 */
export function getVersionInfo (params) {
  return axios({
    url: '/project_cloud/common/getVersionInfoForPaginate',
    method: 'GET',
    params
  })
}

/**
 * @description 新增版本详情
 */
export function addVersionInfo (params) {
  return axios({
    url: '/project_cloud/common/addVersionInfo',
    method: 'PUT',
    data: params
  })
}

/**
 * @description 获取所有版本号
 */
export function getAllVersionNum () {
  return axios({
    url: '/project_cloud/common/getAllVersionNum',
    method: 'GET'
  })
}

/**
 * @description 获取所有版本号
 */
export function updateVersionInfo (params) {
  return axios({
    url: '/project_cloud/common/updateVersionInfo',
    method: 'POST',
    data: params
  })
}
