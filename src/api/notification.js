import axios from '@/plugins/axios.js'

/**
 * @description 获取周年庆读取次数
 */
export function getCacheCount () {
  const params = { cacheKey: 'staffClickCount' }
  return axios({
    url: '/project_cloud/common/getCacheCount',
    method: 'GET',
    params
  }).then(msg => {
    return msg
  })
}

/**
 * @description 获取周年庆读取次数
 */
export function incrCacheCount () {
  const params = { cacheKey: 'staffClickCount' }
  return axios({
    url: '/project_cloud/common/incrCacheCount',
    method: 'PUT',
    data: params
  })
}
