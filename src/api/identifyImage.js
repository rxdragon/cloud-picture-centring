import axios from '@/plugins/axios.js'
import uuidv4 from 'uuid'

/**
 * @description 获取获取相似照片列表
 * @param {*} params
 */
export function getSimilarPhotoList (params) {
  return axios({
    url: '/project_cloud/photoPool/getSimilarPhotoList',
    method: 'GET',
    params
  }).then(msg => {
    const createData = msg.map(item => {
      return {
        id: uuidv4(),
        path: item.uuid
      }
    })
    return createData
  })
}

/**
 * @description 更具照片获取流水信息
 * @param {*} params
 */
export function getPhotoStreamInfo (params) {
  return axios({
    url: '/project_cloud/photoPool/getPhotoStreamInfo',
    method: 'GET',
    params
  }).then(msg => {
    
    return msg
  })
}
