import axios from '@/plugins/axios.js'

/**
 * @description 修图师看到订单时间
 * @param {*} streamId
 */
export function retoucherSee (streamId) {
  const params = {
    streamId,
    event: 'stream_time.retoucher_see'
  }
  return axios({
    url: '/project_cloud/common/logStream',
    method: 'PUT',
    data: params
  })
}

/**
 * @description 重修确认时间
 * @param {*} streamId
 */
export function retoucherRebuildOk (streamId) {
  const params = {
    streamId,
    event: 'stream_time.retoucher_rebuild_ok'
  }
  return axios({
    url: '/project_cloud/common/logStream',
    method: 'PUT',
    data: params
  })
}
