import axios from '@/plugins/axios.js'
import StreamAppealModel from '@/model/StreamAppealModel.js'
import StreamModel from '@/model/StreamModel.js'
import PhotoModel from '@/model/PhotoModel.js'
import PhotoAppealModel from '@/model/PhotoAppealModel.js'
import ProductModel from '@/model/ProductModel.js'

import * as PhotoTool from '@/utils/photoTool.js'

import { PHOTO_VERSION, APPEAL_STREAM_STATUS, APPEAL_TYPE } from '@/utils/enumerate'
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
    const appealInfo = new StreamAppealModel(msg)
    const photoInfo = {}
    const photoAppeals = _.get(msg, 'photo_appeals') || []

    photoAppeals.forEach(photoAppealItem => {
      const photoItem = photoAppealItem.photo
      const photoData = new PhotoModel(photoItem)
      photoData.getCheckPoolTags()
      const photoAppealRecord = new PhotoAppealModel(photoAppealItem)

      const finalPhotoItem = {
        ...photoData,
        reworkChecked: false, // 申诉的勾选
        appealReason: '', // 申诉的说明
        photoAppeals: photoAppealRecord,
        photoVersionId: photoAppealItem.photo_version_id,
        specialEfficacy: _.get(photoAppealItem, 'tags.values.special_efficacy') || '无需特效'
      }

      // 确认是否是看片师新增照片
      const otherPhotoVersion = _.get(photoItem, 'other_photo_version') || []
      const onlyOneOtherPhotoVersion = otherPhotoVersion.length === 1
      const isFinishPhotoVersion = otherPhotoVersion[0].version === PHOTO_VERSION.FINISH_PHOTO
      const storeAddNewVersion = onlyOneOtherPhotoVersion && isFinishPhotoVersion

      // 过滤看片师新增照片
      if (storeAddNewVersion) {
        finalPhotoItem.photoVersion = ''
      } else {
        const allVersionPhoto = [...otherPhotoVersion, ..._.get(photoItem, 'photo_version', [])]

        finalPhotoItem.photoVersion = PhotoTool.settlePhotoVersion(allVersionPhoto)
        finalPhotoItem.photoVersion = finalPhotoItem.photoVersion.reduce((finalVersion, versionItem) => {
          const isStoreRework = versionItem.version === PHOTO_VERSION.STORE_REWORK
          const isCurrentStoreRework = versionItem.id === photoAppealItem.photo_version_id

          // 获取云学院评价
          const commitInfo = { picUrl: _.get(photoItem, 'tags.values.cloud_pic_url') || '' }
          const issueLabel = _.get(photoItem, 'tags.values.check_pool_tags') || []
          versionItem.commitInfo = PhotoTool.handleCommitInfo(commitInfo, issueLabel)

          // 如果是完结状态的申诉详情,需要用appealResult替换掉退回的version的tag,展示本次申诉的结果
          if (isCurrentStoreRework && appealInfo.isFinished) versionItem.tags.values = photoAppealRecord.appealResult
          if (!isStoreRework || isCurrentStoreRework ) finalVersion.push(versionItem)
          return finalVersion
        }, [])
      }

      if (finalPhotoItem.photoVersion) photos.push(finalPhotoItem)
    })

    const orderData = new StreamModel(msg.stream)

    // msg.photo_appeals没有的话,是沙漏申诉,photo去取stream中的
    if (appealInfo.appealType === APPEAL_TYPE.TIMEOUT) {
      const timeoutPhotoAppeal = new PhotoAppealModel(msg)
      orderData.timeoutAppeal = timeoutPhotoAppeal

      msg.stream.photos.forEach(photo => {
        const photoData = new PhotoModel(photo)
        photoData.specialEfficacy = _.get(photo, 'tags.values.special_efficacy') || '无需特效'
        photoData.photoVersion = PhotoTool.settlePhotoVersion(photo.photo_version)
        photos.push(photoData)
      })
    }

    // 获取照片信息photoInfo
    photoInfo.productInfo = new ProductModel(msg.stream.product)
    photoInfo.streamInfo = orderData
    return {
      photoInfo,
      orderData,
      photos,
      appealInfo
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
      const appealData = new StreamAppealModel(appealItem)
      // 判断展示那种按钮
      const isWaitFirst = appealData.state === APPEAL_STREAM_STATUS.WAIT_FIRST
      const isFirstExamine = appealData.state === APPEAL_STREAM_STATUS.FIRST_EXAMINE
      const isWaitSecond = appealData.state === APPEAL_STREAM_STATUS.WAIT_SECOND
      const isSecondExamine = appealData.state === APPEAL_STREAM_STATUS.SECOND_EXAMINE
      const isFinish = appealData.state === APPEAL_STREAM_STATUS.FINISH
      const isExpire = appealData.state === APPEAL_STREAM_STATUS.EXPIRE

      if (isWaitFirst || isFirstExamine) appealData.showFirstCheck = true
      if (isWaitSecond || isSecondExamine ) appealData.showSecondCheck = true
      if (isFinish || isExpire ) appealData.showDetail = true
      return appealData
    })
    msg.list = appealList
    return msg
  })
}
