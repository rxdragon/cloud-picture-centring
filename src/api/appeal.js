import axios from '@/plugins/axios.js'
import StreamAppealModel from '@/model/StreamAppealModel.js'
import StreamModel from '@/model/StreamModel.js'
import PhotoModel from '@/model/PhotoModel.js'
import PhotoAppealModel from '@/model/PhotoAppealModel.js'

import * as PhotoTool from '@/utils/photoTool.js'

import { APPEAL_STREAM_STATUS } from '@/utils/enumerate'
/**
 * @description 初审绑定
 * @param {*} params
 */
export function bindFirst (params) {
  return axios({
    url: '/project_cloud/appeal/bindFirst',
    method: 'GET',
    params
  })
}

/**
 * @description 复审绑定
 * @param {*} params
 */
export function bindSecond (params) {
  return axios({
    url: '/project_cloud/appeal/bindSecond',
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
export function appealExamine (params, type) {
  let url = ''
  if (type === 'first') url = '/project_cloud/appeal/examineFirst'
  if (type === 'second') url = '/project_cloud/appeal/examineSecond'
  return axios({
    url,
    method: 'POST',
    data: params
  })
}

/**
 * @description 申诉详情
 * @param {*} params
 */
export function appealDetail (params, source) {
  let url = '/project_cloud/appeal/detail'
  if (source === 'history') url = '/project_cloud/retoucher/appeal/detail'
  return axios({
    url,
    method: 'GET',
    params
  }).then(msg => {
    const photos = []
    const { base, isFinished, ...rest } = new StreamAppealModel(msg)
    msg.photo_appeals && msg.photo_appeals.forEach(photoAppealItem => {
      const photoItem = photoAppealItem.photo
      const photoData = new PhotoModel(photoItem)
      const { base, appealResult, ...photoAppealRest } = new PhotoAppealModel(photoAppealItem)
      const finalPhotoItem = {
        reworkChecked: false, // 申诉的勾选
        appealReason: '', // 申诉的说明
        wholeReason: photoData.wholeReason,
        partReason: photoData.partReason,
        partNote: photoData.partNote,
        wholeNote: photoData.wholeNote,
        photoAppeals: { ...photoAppealRest },
        photoVersionId: photoAppealItem.photo_version_id
      }
      // 照片版本
      if (photoItem.other_photo_version.length === 1 && photoItem.other_photo_version[0].version === 'finish_photo') {
        // 过滤看片师新增照片
        finalPhotoItem.photoVersion = ''
      } else {
        finalPhotoItem.photoVersion = PhotoTool.settlePhotoVersion(photoItem.other_photo_version)
        finalPhotoItem.photoVersion = finalPhotoItem.photoVersion.reduce((finalVersion, versionItem) => {
          const isStoreRework = versionItem.version === 'store_rework'
          const isCurrentStoreRework = versionItem.id === photoAppealItem.photo_version_id
          // 如果是完结状态的申诉详情,需要用appealResult替换掉退回的version的tag,展示本次申诉的结果
          if (isCurrentStoreRework && isFinished) {
            versionItem.tags.values = appealResult
          }
          if (!isStoreRework || isCurrentStoreRework ) finalVersion.push(versionItem)
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
export function getAppealList (params, type) {
  let url = '/project_cloud/retoucher/appeal/list'
  if (type === 'handle') url = '/project_cloud/appeal/list'
  return axios({
    url,
    method: 'POST',
    data: params
  }).then(msg => {
    const appealList = msg.list.map(appealItem => {
      const { base, ...rest } = new StreamAppealModel(appealItem)
      const finalAppealItem = { ...rest }
      // 判断展示那种按钮
      const isWaitFirst = finalAppealItem.state === APPEAL_STREAM_STATUS.WAIT_FIRST
      const isFirstExamine = finalAppealItem.state === APPEAL_STREAM_STATUS.FIRST_EXAMINE
      const isWaitSecond = finalAppealItem.state === APPEAL_STREAM_STATUS.WAIT_SECOND
      const isSecondExamine = finalAppealItem.state === APPEAL_STREAM_STATUS.SECOND_EXAMINE
      const isFinish = finalAppealItem.state === APPEAL_STREAM_STATUS.FINISH
      const isExpire = finalAppealItem.state === APPEAL_STREAM_STATUS.EXPIRE
      if (isWaitFirst || isFirstExamine) finalAppealItem.showFirstCheck = true
      if (isWaitSecond || isSecondExamine ) finalAppealItem.showSecondCheck = true
      if (isFinish || isExpire ) finalAppealItem.showDetail = true
      return finalAppealItem
    })
    msg.list = appealList
    return msg
  })
}
