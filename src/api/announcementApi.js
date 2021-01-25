import axios from '@/plugins/axios.js'
import AnnouncementModel from '@/model/AnnouncementModel'

/**
 * @description 获取公告中心列表
 * @param {*} params 
 */
export async function getAnnouncementManage (params) {
  const res = await axios({
    url: '/project_cloud_oa/announcement/manage/list',
    method: 'POST',
    data: params
  })
  const list = res.list.map(AnnouncementItem => {
    return {
      ...new AnnouncementModel(AnnouncementItem),
      deleteVisible: false
    }
  })
  res.list = list
  return res
}

/**
 * @description 获取公告中心列表
 * @param {*} params 
 */
export async function getAnnouncementDetail (params) {
  const res = await axios({
    url: '/project_cloud_oa/announcement/manage/detail',
    method: 'POST',
    data: params
  })

  return new AnnouncementModel(res)
}

/**
 * @description 创建公告
 * @param {*} params 
 */
export function createAnnouncementInfo (params) {
  return axios({
    url: '/project_cloud_oa/announcement/manage/add',
    method: 'POST',
    data: params
  })
}

/**
 * @description 创建公告
 * @param {*} params 
 */
export function recordList (params) {
  return axios({
    url: '/project_cloud_oa/announcement/manage/recordList',
    method: 'POST',
    data: params
  })
}

/**
 * @description 删除公告信息
 * @param {*} params 
 */
export function deleteAnnouncement (params) {
  return axios({
    url: '/project_cloud_oa/announcement/manage/delete',
    method: 'POST',
    data: params
  })
}

/**
 * @description 获取公告中心列表
 * @param {*} params 
 */
export async function getAnnouncementCenterList (params) {
  const res = await axios({
    url: '/project_cloud_oa/announcement/center/list',
    method: 'POST',
    data: params
  })
  // TODO 处理接口
  const list = res.list
  return {
    total: res.total,
    list
  }
}
