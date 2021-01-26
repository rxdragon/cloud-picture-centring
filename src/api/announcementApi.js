import axios from '@/plugins/axios.js'
import AnnouncementModel from '@/model/AnnouncementModel'
import { READ_STATE, readToCN } from '@/utils/enumerate'

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
 * @description 获取公告中心公告详情
 * @param {*} params 
 */
export async function getAnnouncementUserDetail (params) {
  const res = await axios({
    url: '/project_cloud_oa/announcement/center/detail',
    method: 'POST',
    data: params
  })
  const createData = new AnnouncementModel(res)
  const readState = _.get(res, 'record.read') ? READ_STATE.READ : READ_STATE.UNREAD
  const readStateCN = readToCN[readState]

  createData.readState = readState
  createData.readStateCN = readStateCN

  return createData
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
 * @description 获取未读取列表
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
  const list = res.list.map(announcementItem => {
    const readState = _.get(announcementItem, 'record.read') ? READ_STATE.READ : READ_STATE.UNREAD
    const readStateCN = readToCN[readState]
    return {
      ...new AnnouncementModel(announcementItem),
      readState,
      readStateCN
    }
  })
  return {
    total: res.total,
    list
  }
}

/**
 * @description 已读
 * @param {*} params 
 */
export function readAnnouncement (params) {
  return axios({
    url: '/project_cloud_oa/announcement/center/read',
    method: 'POST',
    data: params
  })
}
