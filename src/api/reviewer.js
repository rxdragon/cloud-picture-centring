import axios from '@/plugins/axios.js'
import { keyToHump, timeFormat } from '@/utils/index.js'
import { waitTime } from '@/utils/validate.js'
import { StreamStatics } from '@/utils/enumerate.js'

/**
 * @description 获取审核信息
 */
export function getReviewInfo () {
  return axios({
    url: '/project_cloud/reviewer/getReviewInfo',
    method: 'GET'
  }).then(msg => {
    if (!msg) return null
    const createData = {}
    createData.canGlass = true
    msg.photos.forEach(photoItem => {
      const findOrigianlPhoto = photoItem.other_photo_version.find(photoItem => photoItem.version === 'original_photo')
      const findOrigianlPhotoPath = (findOrigianlPhoto && findOrigianlPhoto.path) || ''
      const lastFirstPhotoPath = (photoItem.last_first_photo && photoItem.last_first_photo.path) || ''
      photoItem.priviewPhotoData = [{
        id: photoItem.id,
        path: findOrigianlPhotoPath,
        version: 'original_photo'
      }, {
        id: photoItem.id,
        path: lastFirstPhotoPath,
        version: 'first_photo'
      }]
      photoItem.isTemplate = photoItem.priviewPhotoData[0].path.includes('template')
      photoItem.isRework = false
      photoItem.showReturnLabel = photoItem.other_photo_version.find(versionItem => {
        const isReturnShow = versionItem.version === 'return_show'
        return isReturnShow
      })
      if (photoItem.tags && photoItem.tags.statics) {
        photoItem.isRework = photoItem.tags.statics.includes('return_photo')
        photoItem.canGlass = !photoItem.tags.statics.includes('plant') &&
          !photoItem.tags.statics.includes('pull') &&
          !photoItem.isRework
        if (!photoItem.canGlass) {
          createData.canGlass = false
        }
      }
      photoItem.glass = ''
      photoItem.grassReason = ''
      photoItem.reworkMark = false
      photoItem.reworkMarkReason = ''
      photoItem.reworkLabel = []
    })
    createData.streamId = msg.id
    createData.streamNum = msg.stream_num
    createData.type = (msg.product && msg.product.retouch_standard) || '-'
    createData.photographerName = (msg.order.photographer_org && msg.order.photographer_org.name) || '-'
    createData.photographer = msg.order.tags && msg.order.tags.values.photographer
    createData.productName = (msg.product && msg.product.name) || '-'
    createData.photoNum = msg.photos.filter(item => +item.people_num > 0).length
    createData.waitTime = waitTime(msg.created_at, msg.pass_at)
    createData.retouchRemark = msg.note.retouch_note
    createData.backgroundColor = msg.note.color_note || ''
    createData.reviewerNote = (msg.tags && msg.tags.values && msg.tags.values.review_reason) || '暂无审核备注'
    createData.requireLabel = (msg.tags && msg.tags.values && msg.tags.values.retouch_claim) || {}
    createData.streamState = msg.state
    createData.isCheckReturn = msg.tags && msg.tags.statics && msg.tags.statics.includes(StreamStatics.CheckReturn)
    createData.isStoreReturn = msg.tags && msg.tags.statics && msg.tags.statics.includes(StreamStatics.StoreReturn)
    createData.photos = msg.photos
    createData.retoucherName = (msg.retoucher && (msg.retoucher.name || msg.retoucher.real_name)) || '-'
    // todo mock
    // eslint-disable-next-line max-len
    createData.referencePhoto = 'https://cloud-dev.cdn-qn.hzmantu.com/compress/2020/10/16/FmoHaS4TIY2QyUYAP8cpEoWzAMo3.png'
    return createData
  })
}

/**
 * @description 获取审核队列信息
 */
export function getReviewQueueInfo () {
  return axios({
    url: '/project_cloud/reviewer/getReviewQueueInfo',
    method: 'GET'
  })
}

/**
 * @description 获取今日审核工作统计
 * @param {*} params
 */
export function getTodayReviewQuota () {
  return axios({
    url: '/project_cloud/reviewer/getTodayReviewQuota',
    method: 'GET'
  }).then(msg => {
    const createData = keyToHump(msg)
    createData.todayReviewTimes = timeFormat(createData.todayReviewTimes, 'text', true)
    return createData
  })
}

/**
 * @description 进入审核人队列
 * @param {*} params
 */
export function joinReviewQueue (params) {
  return axios({
    url: '/project_cloud/reviewer/joinReviewQueue',
    method: 'PUT',
    data: params
  })
}

/**
 * @description 退出审核人队列
 * @param {*} params
 */
export function exitReviewQueue (params) {
  return axios({
    url: '/project_cloud/reviewer/exitReviewQueue',
    method: 'PUT',
    data: params
  })
}

/**
 * @description 审核通过
 * @param {*} params
 */
export function passStream (params) {
  return axios({
    url: '/project_cloud/reviewer/passStream',
    method: 'PUT',
    data: params
  })
}

/**
 * @description 审核退单
 * @param {*} params
 */
export function refuseStream (params) {
  return axios({
    url: '/project_cloud/reviewer/refuseStream',
    method: 'PUT',
    data: params
  })
}
