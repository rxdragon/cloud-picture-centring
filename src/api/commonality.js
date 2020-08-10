// commonality
import axios from '@/plugins/axios.js'
import store from '@/store' // vuex
import { keyToHump } from '@/utils/index.js'
import * as PhotoTool from '@/utils/photoTool.js'


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
    const data = keyToHump(msg)
    const createData = {}
    const reworkNum = _.get(data, 'tags.values.rework_num') || 0
    const storeReworkNum = _.get(data, 'tags.values.store_rework_num') || 0
    const store_evaluate = _.get(data, 'storeEvaluateStream.store_evaluate') || '-'
    let retoucherNpsAvg = _.get(data, 'tags.values.retoucher_score') || '-'
    const npsAvgEnum = { 10: `超满意（10分）`, 6: `基本满意（6分）`, 2: `不满意（2分）` }
    retoucherNpsAvg = npsAvgEnum[+retoucherNpsAvg] || `${retoucherNpsAvg}`
    const retouchAllTime = ((data.retouchTime + data.reviewReturnRebuildTime) / 60).toFixed(2) + 'min'
    const reviewTime = (data.reviewTime / 60).toFixed(2) + 'min'
    data.photos.forEach(photoItem => {
      let wholeReason = []
      let partReason = []
      let partNote = ''
      const part = _.get( photoItem, 'tags.values.part', [])
      const storePartReworkReason = _.get( photoItem, 'tags.values.store_part_rework_reason', [])
      const filmEvaluation = _.get(photoItem, 'tags.values.film_evaluation') || ''
      const labels = _.get( photoItem, 'tags.values.labels', [])
      const storeReworkReason = _.get( photoItem, 'tags.values.store_rework_reason', '')
      const storeReworkNote = _.get(photoItem, 'tags.values.store_rework_note')
      photoItem.filmEvaluation = filmEvaluation
      photoItem.reworkNum = reworkNum
      photoItem.reworkChecked = false // 申诉的勾选
      photoItem.appealReason = '' // 申诉的说明

      // 照片版本
      if (photoItem.other_photo_version.length === 1 && photoItem.other_photo_version[0].version === 'finish_photo') {
        // 过滤看片师新增照片
        photoItem.photoVersion = ''
      } else {
        photoItem.photoVersion = PhotoTool.settlePhotoVersion(photoItem.other_photo_version)
      }
      // 处理整体的退单标记
      // 判断是新的数据还是老的数据,新的数据有labels字段
      if (labels.length) {
        labels.forEach(labelsItem => {
          wholeReason.push(labelsItem.name)
        })
      } else {
        wholeReason = wholeReason.concat(storeReworkReason ? storeReworkReason.split('+') : [])
      }
      photoItem.wholeReason = wholeReason
      // 处理局部的退单标记
      // 判断是新的数据还是老的数据,新的数据有part字段
      if (part.length) {
        part.forEach(partItem => {
          partItem.labels.forEach(labelItem => {
            partReason.push(labelItem.name)
            partNote += partItem.note
          })
        })
      } else {
        storePartReworkReason.forEach(partReasonItem => {
          partReason = [...partReasonItem.reason.split('+'), ...partReason]
          partReasonItem.note && (partNote += partReasonItem.note + ' ')
        })
      }
      photoItem.partReason = partReason
      photoItem.partNote = partNote || '暂无备注'
      photoItem.wholeNote = storeReworkNote || '暂无备注'
      

      if (photoItem.photoVersion) {
        photoItem.photoVersion.forEach(versionItem => {
          versionItem.isLekima = _.get(versionItem, 'tags.statics', []).includes('lichma')
          versionItem.phototag = photoItem.tags

          // 获取云学院评价
          const commitInfo = { picUrl: _.get(photoItem, 'tags.values.cloud_pic_url') || '' }
          const issueLabel = _.get(versionItem, 'phototag.values.check_pool_tags') || []
          if (!issueLabel.length && !commitInfo.picUrl) return
          versionItem.commitInfo = PhotoTool.handleCommitInfo(commitInfo, issueLabel)
        })
      }
    })
    data.photos = data.photos.filter(photoItem => Boolean(photoItem.photoVersion))
    let referencePhoto = _.get(data, 'tags.values.retouch_claim.referenceImg')
    referencePhoto = referencePhoto ? store.getters.imgDomain + referencePhoto : ''
    createData.orderData = {
      currentStreamAppeal: data.currentStreamAppeal,
      streamNum: data.streamNum,
      photographerOrg: data.order ? data.order.photographer_org.name : '-',
      productName: _.get(data, 'product.name', '-'),
      photoNum: data.photos.filter(item => +item.people_num > 0).length,
      photographerName: _.get(data, 'order.tags.values.photographer') || '-',
      reworkNum,
      storeReworkNum,
      retouchAllTime,
      retoucherNpsAvg,
      reviewTime,
      store_evaluate,
      overTime: data.hourGlass ? data.hourGlass.over_time + 'min' : '-',
      requireLabel: _.get(data, 'tags.values.retouch_claim', {}),
      referencePhoto,
      retouchRemark: data.note.retouch_note || '暂无修图备注',
      backgroundColor: msg.note.color_note || '',
      reviewerNote: _.get(data, 'tags.values.review_reason', '暂无审核备注')
    }
    createData.photos = data.photos
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
