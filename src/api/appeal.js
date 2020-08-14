import axios from '@/plugins/axios.js'
import StreamAppealModel from '@/model/StreamAppealModel.js'
import StreamModel from '@/model/StreamModel.js'
import PhotoModel from '@/model/PhotoModel.js'
import PhotoAppealModel from '@/model/PhotoAppealModel.js'

import * as PhotoTool from '@/utils/photoTool.js'

import { APPEAL_STREAM_STATUS } from '@/utils/enumerate'
/**
 * @description 申诉绑定
 * @param {*} params
 */
export function bindAppeal (params) {
  return axios({
    url: '/project_cloud/appeal/bind',
    method: 'GET',
    params
  })
}

/**
 * @description 发起申诉
 * @param {*} params
 */
export function addAppeal (params) {
  return axios({
    url: '/project_cloud/appeal/add',
    method: 'POST',
    data: params
  })
}

/**
 * @description 审核
 * @param {*} params
 */
export function appealExamine (params) {
  return axios({
    url: '/project_cloud/appeal/examine',
    method: 'POST',
    data: params
  })
}

/**
 * @description 申诉详情
 * @param {*} params
 */
export function appealDetail (params) {
  return axios({
    url: '/project_cloud/appeal/detail',
    method: 'GET',
    params
  }).then(msg => {
    const photos = []
    const { base, ...rest } = new StreamAppealModel(msg)
    msg.photo_appeals.forEach(photoAppealItem => {
      const photoItem = photoAppealItem.photo
      const photoData = new PhotoModel(photoItem)
      const { base, ...rest } = new PhotoAppealModel(photoAppealItem)
      const finalPhotoItem = {
        reworkChecked: false, // 申诉的勾选
        appealReason: '', // 申诉的说明
        wholeReason: photoData.wholeReason,
        partReason: photoData.partReason,
        partNote: photoData.partNote,
        wholeNote: photoData.wholeNote,
        photoAppeals: { ...rest },
        photoVersionId: photoAppealItem.photo_version_id
      }
      // 照片版本
      if (photoItem.other_photo_version.length === 1 && photoItem.other_photo_version[0].version === 'finish_photo') {
        // 过滤看片师新增照片
        finalPhotoItem.photoVersion = ''
      } else {
        finalPhotoItem.photoVersion = PhotoTool.settlePhotoVersion(photoItem.other_photo_version)
        finalPhotoItem.photoVersion = finalPhotoItem.photoVersion.reduce((finalVersion, versionItem) => {
          if (versionItem.version !== 'store_rework' || versionItem.id === photoAppealItem.photo_version_id ) finalVersion.push(versionItem)
          return finalVersion
        }, [])
      }
      if (finalPhotoItem.photoVersion) photos.push(finalPhotoItem)
    })
    const { baseData, ...restSteamData } = new StreamModel(msg.stream)
    const orderData = { ...restSteamData }
    return {
      orderData,
      photos,
      appealInfo: { ...rest }
    }
  })
}

/**
 * @description 查询申诉记录
 */
export function getAppealList (params) {
  return axios({
    url: '/project_cloud/appeal/list',
    method: 'POST',
    data: params
  }).then(msg => {
    const appealList = msg.list.map(appealItem => {
      const { base, ...rest } = new StreamAppealModel(appealItem)
      const finalAppealItem = { ...rest }
      // 判断展示那种按钮
      if (finalAppealItem.state === APPEAL_STREAM_STATUS.WAIT_FIRST || finalAppealItem.state === APPEAL_STREAM_STATUS.FIRST_EXAMINE ) finalAppealItem.showFirstCheck = true
      if (finalAppealItem.state === APPEAL_STREAM_STATUS.WAIT_SECOND || finalAppealItem.state === APPEAL_STREAM_STATUS.SECOND_EXAMINE ) finalAppealItem.showSecondCheck = true
      return finalAppealItem
    })
    return appealList
  })
}
