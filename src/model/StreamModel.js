import * as Validate from '@/utils/validate.js'

// 流水静态状态资源
export const StreamStatics = {
  STORERETURN: 'store_rework',
  CHECKRETURN: 'rework'
}

/**
 * @property {Number} streamId - 流水id
 * @property {String} updated_at -更新时间
 */
export default class StreamModel {
  baseData = null
  streamId = '' // 流水id
  streamNum = '' // 流水号
  photographerUpdate = '' // 上传时间
  isCheckReturn = false // 是否是审核退回
  isStoreReturn = false // 是否是门店退回
  waitTime = '' // 流水号等待时间
  streamState = '' // 流水状态
  retouchRemark = '' // 修图备注
  backgroundColor = '' // 背景备注
  photographyNote = '' // 摄影备注
  reviewerNote = '' // 审核备注
  requireLabel = {} // 修图要求
  photoNum = 0 // 照片数据
  isGreen = false // 是否是绿色通道
  retoucher = '' // 修图师
  retoucherLeader = "" // 修图组长

  constructor (streamData) {
    if (!streamData) return
    this.baseData = streamData
    this.streamId = streamData.id || ''
    this.streamNum = streamData.stream_num || ''
    this.photographerUpdate = streamData.created_at || ''
    this.isCheckReturn = _.get(streamData, 'tags.statics', []).includes(StreamStatics.CHECKRETURN)
    this.isStoreReturn = _.get(streamData, 'tags.statics', []).includes(StreamStatics.STORERETURN)
    this.waitTime = Validate.waitTime(this.baseData.created_at, this.baseData.pass_at)
    this.streamState = streamData.state || ''
    this.getNote(streamData.note)
    this.reviewerNote = _.get(streamData, 'reviewer_note') || ''
    const retouchRequire = {
      eye: '暂无',
      face: '暂无',
      pimples: false
    }
    this.requireLabel = _.get(streamData, 'tags.values.retouch_claim') || retouchRequire
    this.photoNum = this.getPhotoNum()
    this.isGreen = _.get(streamData, 'tags.statics', []).includes('green_stream')
    this.retoucher = _.get(streamData, 'retoucher.name') || _.get(streamData, 'retoucher.real_name') || '-'
    this.retoucherLeader = _.get(streamData, 'retoucher.retoucher_leader.name') || _.get(streamData, 'retoucher.retoucher_leader.real_name') || '-'
  }

  // 获取沙漏相关信息
  get sandClockInfo () {
    if (this.baseData.state === 'hanging') {
      return {
        hangTime: Validate.waitTime(this.baseData.last_hang_at)
      }
    } else {
      return {
        isGreen: false,
        isOrange: false,
        isOver: false,
        isRework: _.get(this.baseData, 'tags.statics', []).includes('rework')
      }
    }
  }

  // 获取照片数量
  getPhotoNum () {
    if (!this.baseData.photos_count) {
      const photos = this.baseData.photos
      if (!photos) return 0
      return photos.filter(item => +item.people_num > 0).length
    }
    return this.baseData.photos_count
  }

  getNote (streamNote) {
    this.retouchRemark = streamNote.retouch_note // 修图备注
    this.backgroundColor = streamNote.color_note // 背景备注
    this.photographyNote = streamNote.photography_note // 摄影备注
  }
}
