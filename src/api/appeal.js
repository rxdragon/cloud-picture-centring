import axios from '@/plugins/axios.js'
import AppealListItemModel from '@/model/AppealListItemModel.js'
import StreamModel from '@/model/StreamModel.js'
import PhotoModel from '@/model/PhotoModel.js'
import PhotoAppealModel from '@/model/PhotoAppealModel.js'
import * as PhotoTool from '@/utils/photoTool.js'

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
    const { id } = msg
    let photos = []
    msg.photo_appeals.forEach(photoAppealItem => {
      const photoItem = photoAppealItem.photo
      const photoData = new PhotoModel(photoItem)
      const { baseData, ...rest } = new PhotoAppealModel(photoAppealItem)
      const finalPhotoItem = {
        reworkChecked: false, // 申诉的勾选
        appealReason: '', // 申诉的说明
        wholeReason: photoData.wholeReason,
        partReason: photoData.partReason,
        partNote: photoData.partNote,
        wholeNote: photoData.wholeNote,
        photoAppeals: { ...rest }
      }
      // 照片版本
      if (photoItem.other_photo_version.length === 1 && photoItem.other_photo_version[0].version === 'finish_photo') {
        // 过滤看片师新增照片
        finalPhotoItem.photoVersion = ''
      } else {
        finalPhotoItem.photoVersion = PhotoTool.settlePhotoVersion(photoItem.other_photo_version)
      }
      photos.push(finalPhotoItem)
    })
    const streamData = new StreamModel(msg.stream)
    const orderData = {
      streamNum: streamData.streamNum,
      photoNum: streamData.photoNum,
      requireLabel: streamData.requireLabel,
      referencePhoto: streamData.referencePhoto,
      retouchRemark: streamData.retouchRemark,
      backgroundColor: streamData.backgroundColor,
      reviewerNote: streamData.reviewerNote
    }
    return {
      orderData,
      photos,
      appealInfo: {
        id
      }
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
      const { baseData, ...rest } = new AppealListItemModel(appealItem)
      return { ...rest }
    })
    return appealList
  })
}
