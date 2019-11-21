// retoucherCenter
import axios from '@/plugins/axios.js'
import { keyToHump } from '@/utils/index.js'
import { waitTime } from '@/utils/validate.js'
import * as photoTool from '@/utils/photoTool.js'

/**
 * @description 流水列表[待修，挂起]
 * @param {*} params [state]
 */
export function getRetouchStreams (params) {
  return axios({
    url: '/project_cloud/retoucher/getRetouchStreams',
    method: 'get',
    params
  }).then(msg => {
    msg.data.forEach(listItem => {
      listItem.streamNum = listItem.stream_num
      listItem.streamId = listItem.id
      listItem.productName = listItem.product && listItem.product.name || '-'
      listItem.photoNum = listItem.photos_count
      listItem.type = listItem.product.retouch_standard
      listItem.photographerName = listItem.order && listItem.order.photographer_org ? listItem.order.photographer_org.name : '-'
      listItem.waitTime = waitTime(listItem.created_at)
      listItem.photographerUpdate = listItem.created_at || '-'
      listItem.isCheckReturn = listItem.tags && listItem.tags.statics && listItem.tags.statics.includes('rework') || false
      if (params.state === 'hanging') {
        listItem.hangTime = waitTime(listItem.last_hang_at)
      } else {
        listItem.isGreen = false
        listItem.isOrange = false
        listItem.isOver = false
        listItem.isRework = false
        if (listItem.tags && listItem.tags.statics && listItem.tags.statics.includes('rework')) {
          listItem.isRework = true
        }
      }
    })
    return msg
  })
}

/**
 * @description 获取流水信息
 * @param {*} params
 */
export function getStreamInfo (params) {
  return axios({
    url: '/project_cloud/retoucher/getStreamInfo',
    method: 'get',
    params
  }).then(msg => {
    const createData = {}
    const notTemplePhoto = msg.photos.filter(item => item.type !== 'template')
    createData.orderData = {
      streamNum: msg.stream_num,
      type: msg.product && msg.product.retouch_standard,
      photographerName: msg.order.photographer_org ? msg.order.photographer_org.name : '-',
      photographer: msg.order.tags ? msg.order.tags.values.photographer : '-', // 摄影
      productName: msg.product && msg.product.name,
      photoNum: notTemplePhoto.length,
      waitTime: waitTime(msg.created_at),
      retouchRemark: msg.note.retouch_note,
      requireLabel: msg.tags ? msg.tags.values.retouch_claim : {},
      streamState: msg.state
    }
    msg.photos.forEach(photoItem => {
      const findOriginalPhoto = photoItem.photo_version.find(versionItem => versionItem.version === 'original_photo')
      photoItem.path = findOriginalPhoto && photoTool.handlePicPath(findOriginalPhoto.path)
      photoItem.isCover = false
    })
    if (msg.tags && msg.tags.statics && msg.tags.statics.includes('rework')) {
      createData.photos = msg.photos.filter(photoItem => {
        const isReturnPhoto = photoItem.tags && photoItem.tags.statics && photoItem.tags.statics.includes('return_photo')
        photoItem.isReturnPhoto = isReturnPhoto
        const findReturnPhoto = photoItem.photo_version.find(versionItem => versionItem.version === 'return_photo')
        photoItem.returnPhotoPath = isReturnPhoto && photoTool.handlePicPath(findReturnPhoto.path)
        return isReturnPhoto
      })
    } else {
      createData.photos = msg.photos
    }
    createData.hourGlass = msg.hour_glass
    createData.reviewerNote = msg.tags && msg.tags.values && msg.tags.values.review_reason || '暂无审核备注'
    return createData
  })
}

/**
  * @description 挂起流水
  * @param {*} params
  */
export function hangStream (params) {
  return axios({
    url: '/project_cloud/retoucher/hangStream',
    method: 'PUT',
    data: params
  })
}

/**
 * @description 提交订单
 */
export function submitStream (params) {
  return axios({
    url: '/project_cloud/retoucher/submitStream',
    method: 'PUT',
    data: params
  })
}

/**
 * @description 获取排队信息
 */
export function getStreamQueueInfo () {
  return axios({
    url: '/project_cloud/retoucher/getStreamQueueInfo',
    method: 'GET'
  }).then(msg => {
    return keyToHump(msg)
  })
}

/**
 * @description 退出流水
 */
export function exitQueue () {
  return axios({
    url: '/project_cloud/retoucher/exitQueue',
    method: 'POST'
  })
}

/**
 * @description 加入流水
 */
export function joinQueue () {
  return axios({
    url: '/project_cloud/retoucher/joinQueue',
    method: 'PUT'
  })
}

/**
 * @description 获取历史修图报告列表
 * @param {*} params
 */
export function getRetouchQuotaList (params) {
  return axios({
    url: '/project_cloud/retoucher/getRetouchQuotaList',
    method: 'GET',
    params
  }).then(msg => {
    const createData = {
      page: msg.pages,
      total: msg.total,
      list: []
    }
    msg.list.forEach(listItem => {
      const allTime = listItem.retouch_time + listItem.review_return_rebuild_time
      listItem.pass_at = listItem.pass_at || '-'
      listItem.retouchAllTime = (allTime / 60).toFixed(0) + 'min'
      let findPlantPhoto = []
      let findPullPhoto = []
      findPlantPhoto = listItem.photos.filter(photoItem => {
        if (photoItem.tags && photoItem.tags.statics) return photoItem.tags.statics.includes('plant')
        return
      })
      findPullPhoto = listItem.photos.filter(photoItem => {
        if (photoItem.tags && photoItem.tags.statics) return photoItem.tags.statics.includes('pull')
        return
      })
      listItem.plantNum = findPlantPhoto.length
      listItem.pullNum = findPullPhoto.length
    })
    createData.list = msg.list
    return createData
  })
}
