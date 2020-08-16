// commonality
import axios from '@/plugins/axios.js'
import * as PhotoTool from '@/utils/photoTool.js'
import StreamModel from '@/model/StreamModel.js'
import PhotoModel from '@/model/PhotoModel.js'
import { PHOTO_VERSION } from '@/utils/enumerate'


/**
 * @description 获取修图类型
 */
export function getAllRetouchClass () {
  return axios({
    url: '/project_cloud/common/getAllRetouchClass',
    method: 'GET'
  }).then(res => {
    const createData = []
    res.forEach(classItem => {
      createData.push({
        label: classItem.name,
        value: Number(classItem.id)
      })
    })
    return createData
  })
}

/**
 * @description 获取流水信息
 * @param {*} params
 */
export function getStreamInfo (params) {
  return axios({
    url: '/project_cloud/common/getStreamInfo',
    method: 'GET',
    params
  }).then(msg => {
    const streamData = new StreamModel(msg)
    const createData = {}
    const npsAvgEnum = { 10: `超满意（10分）`, 6: `基本满意（6分）`, 2: `不满意（2分）` }
    const photos = []
    msg.photos.forEach(photoItem => {
      const { baseData, ...rest } = new PhotoModel(photoItem)
      const finalPhotoItem = {
        ...rest,
        reworkNum: streamData.reworkNum,
        reworkChecked: false,
        appealReason: '',
        tags: photoItem.tags
      }
      // 照片版本
      if (photoItem.other_photo_version.length === 1 && photoItem.other_photo_version[0].version === 'finish_photo') {
        // 过滤看片师新增照片
        finalPhotoItem.photoVersion = ''
      } else {
        finalPhotoItem.photoVersion = PhotoTool.settlePhotoVersion(photoItem.other_photo_version)
      }
      if (finalPhotoItem.photoVersion) {
        finalPhotoItem.photoVersion.forEach(versionItem => {
          versionItem.isLekima = _.get(versionItem, 'tags.statics', []).includes('lichma')
          versionItem.phototag = photoItem.tags

          // 获取云学院评价
          const commitInfo = { picUrl: _.get(photoItem, 'tags.values.cloud_pic_url') || '' }
          const issueLabel = _.get(versionItem, 'phototag.values.check_pool_tags') || []
          if (!issueLabel.length && !commitInfo.picUrl) return
          versionItem.commitInfo = PhotoTool.handleCommitInfo(commitInfo, issueLabel)
        })
        // 第一个store_rework才是c流水的退回原因
        let hasRework = false
        finalPhotoItem.photoVersion = finalPhotoItem.photoVersion.reduce((photoVersionSum, photoVersion) => {
          if (photoVersion.version === PHOTO_VERSION.STORE_REWORK && !hasRework) {
            photoVersionSum.push(photoVersion)
            hasRework = true
          }
          if (photoVersion.version !== PHOTO_VERSION.STORE_REWORK) {
            photoVersionSum.push(photoVersion)
          }
          return photoVersionSum
        }, [])
      }

      photos.push(finalPhotoItem)
    })
    msg.photos = photos.filter(photoItem => Boolean(photoItem.photoVersion))
    createData.orderData = {
      currentStreamAppeal: streamData.currentStreamAppeal,
      streamNum: streamData.streamNum,
      photographerOrg: streamData.photographerOrgName,
      productName: streamData.productName,
      photoNum: msg.photos.filter(item => +item.people_num > 0).length,
      photographerName: streamData.photographerName,
      reworkNum: streamData.reworkNum,
      storeReworkNum: streamData.storeReturnNum,
      retouchAllTime: streamData.retouchAllTime,
      retoucherNpsAvg: npsAvgEnum[streamData.retoucherNpsAvg] || `${streamData.retoucherNpsAvg}`,
      reviewTime: (streamData.reviewTime / 60).toFixed(2) + 'min',
      store_evaluate: streamData.goodEvaluate,
      overTime: streamData.hourGlassOverTime ? streamData.hourGlassOverTime + 'min' : '-',
      requireLabel: streamData.requireLabel,
      referencePhoto: streamData.referencePhoto,
      retouchRemark: streamData.retouchRemark,
      backgroundColor: streamData.backgroundColor,
      reviewerNote: streamData.reviewerNote
    }
    createData.photos = msg.photos
    return createData
  })
}

/**
 * @description 获取修改他人记录
 * @param {*} params 
 */
export function getModifyRetouchQuotaInfo (params) {
  return axios({
    url: '/project_cloud/retoucher/getModifyRetouchQuotaInfo',
    method: 'GET',
    params
  })
}

/**
 * @description 获取七牛云接口
 * @param {*} params
 */
export function getSignature (params) {
  return axios({
    url: '/project_cloud/photoManager/getUploadToken',
    method: 'GET'
  }).then(msg => {
    const createData = {
      token: msg
    }
    return createData
  })
}

/**
 * @description 覆盖上传
 */
export function createPhotoVersion (params) {
  return axios({
    url: '/project_cloud/photoManager/createPhotoVersion',
    method: 'GET',
    params
  })
}
