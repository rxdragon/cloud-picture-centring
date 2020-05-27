import * as Validate from '@/utils/validate.js'
import store from '@/store' // vuex

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
  isCheckReturn = false // 是否是审核退回
  streamState = '' // 流水状态
  retouchRemark = '' // 修图备注
  backgroundColor = '' // 背景备注
  referencePhoto = '' // 参考图
  photographyNote = '' // 摄影备注
  dresserNote = '' // 化妆备注
  orderNote = '' // 订单备注
  reviewerNote = '' // 审核备注
  requireLabel = {} // 修图要求
  photoNum = 0 // 照片数据
  isGreen = false // 是否是绿色通道
  retoucher = '' // 修图师
  retoucherLeader = "" // 修图组长

  // 海草
  exp = ''

  // 时间
  waitTime = '' // 流水号等待时间
  photographerUpdate = '' // 上传时间
  receiptAt = '-' // 接单时间
  passAt = '-' // 审核通过时间
  retouchAllTime = '-' // 修图总时长

  // 门店退回相关
  storeReturnNum = '-' // 门店退回张数
  lekimaCount = '-' // 利奇马樟树
  isStoreReturn = false // 是否是门店退回
  qualityNum = '' // 门店退回质量问题张数
  notQualityNum = '' // 门店退回非质量问题张数

  // 评价相关
  goodEvaluate = '-'
  retoucherNpsAvg = '-'

  // 收益
  retouchIncome = 0
  rewordIncome = 0
  punishIncome = 0
  actualIncome = 0


  constructor (streamData) {
    if (!streamData) return
    this.baseData = streamData
    this.streamId = streamData.id || ''
    this.streamNum = streamData.stream_num || ''
    this.streamState = streamData.state || ''
    this.getNote()
    this.getTime()
    this.getIncome()
    const retouchRequire = {
      eye: '暂无',
      face: '暂无',
      pimples: false
    }
    this.requireLabel = _.get(streamData, 'tags.values.retouch_claim') || retouchRequire

    this.isCheckReturn = _.get(streamData, 'tags.statics', []).includes(StreamStatics.CHECKRETURN)
    this.reviewerNote = _.get(streamData, 'reviewer_note') || ''

    const referencePhoto = _.get(streamData, 'tags.values.retouch_claim.referenceImg')
    this.referencePhoto = referencePhoto ? store.getters.imgDomain + referencePhoto : ''
    this.photoNum = this.getPhotoNum()
    this.isGreen = _.get(streamData, 'tags.statics', []).includes('green_stream')
    this.retoucher = _.get(streamData, 'retoucher.name') || _.get(streamData, 'retoucher.real_name') || '-'
    this.retoucherLeader = _.get(streamData, 'retoucher.retoucher_leader.name') || _.get(streamData, 'retoucher.retoucher_leader.real_name') || '-'

    this.isStoreReturn = _.get(streamData, 'tags.statics', []).includes(StreamStatics.STORERETURN)
    this.storeReturnNum = _.get(streamData, 'tags.values.store_rework_photo_num') || '-'
    this.qualityNum = _.get(streamData, 'tags.values.qualityNum') || 0
    this.notQualityNum = _.get(streamData, 'tags.values.notQualityNum') || 0

    this.lekimaCount = _.get(streamData, 'tags.values.lichma_photo_num') || '-'
    this.goodEvaluate = _.get(streamData, 'store_evaluate_stream.store_evaluate') || '-'
    this.retoucherNpsAvg = _.get(streamData, 'tags.values.retoucher_score') || '-'
    this.exp = Number(streamData.exp) ? parseFloat(streamData.exp) : '-'

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

  // 获取收益
  getIncome () {
    // TODO 接口联调
    const retouchIncome = parseFloat(this.baseData.income) || 0 // 原始收益
    const rewordIncome = parseFloat(_.get(this.baseData, 'tags.values.reword_income')) || 0
    const punishIncome = parseFloat(_.get(this.baseData, 'tags.values.punish_income')) || 0
    const actualIncome = retouchIncome + rewordIncome - punishIncome
    this.retouchIncome = retouchIncome
    this.rewordIncome = rewordIncome
    this.punishIncome = punishIncome
    this.actualIncome = actualIncome
  }

  // 获取时间相关
  getTime () {
    this.photographerUpdate = this.baseData.created_at || '-'
    this.receiptAt = this.baseData.receipt_at || '-'
    this.passAt = this.baseData.pass_at || '-'
    this.waitTime = Validate.waitTime(this.baseData.created_at, this.baseData.pass_at)
    const retouchTime = _.get(this.baseData, 'retouch_time') || 0
    const reviewReturnRebuildTime = _.get(this.baseData, 'review_return_rebuild_time') || 0
    const allTime = retouchTime + reviewReturnRebuildTime
    this.retouchAllTime = (allTime / 60).toFixed(0) + 'min'
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

  // 获取日志相关
  getNote () {
    this.retouchRemark = _.get(this.baseData, 'note.retouch_note') || '-' // 修图备注
    this.backgroundColor = _.get(this.baseData, 'note.color_note') || '' // 背景备注
    this.photographyNote = _.get(this.baseData, 'note.photography_note') || '-' // 摄影备注
    this.dresserNote = _.get(this.baseData, 'order.note.dresserNote') || '-' // 化妆备注
    this.orderNote = _.get(this.baseData, 'order.note.orderNote') || '-' // 订单备注
  }
}
