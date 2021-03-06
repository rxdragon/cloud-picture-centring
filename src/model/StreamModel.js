import * as Validate from '@/utils/validate.js'
import { SPOT_CHECK_MAP } from '@/utils/enumerate'
import store from '@/store' // vuex

// 标记枚举
export const STREAM_TAG = {
  STORERETURN: 'store_rework', // 退回标记，可能是退回生成标记
  STORE_RETURNED: 'is_returned', // 被退回
  CHECKRETURN: 'rework',
  CLOUD_EVALUATION: 'cloud_evaluation'
}

// 抽查类型
export const EVALUATION_TYPE = {
  [SPOT_CHECK_MAP.SHOW_PIC_SPOT]: '修修兽抽查',
  [SPOT_CHECK_MAP.CHECK_POOL_SPOT]: '云学院抽查'
}

/**
 * @property {Number} streamId - 流水id
 * @property {String} updated_at -更新时间
 */
export default class StreamModel {
  baseData = {}
  streamId = '' // 流水id
  streamNum = '' // 流水号
  isCheckReturn = false // 是否是审核退回
  streamState = '' // 流水状态

  retouchRemark = '' // 修图备注
  referencePhoto = '' // 参考图
  backgroundColor = '' // 背景备注
  photographyNote = '' // 摄影备注
  dresserNote = '' // 化妆备注
  orderNote = '' // 订单备注
  reviewerNote = '' // 审核备注
  retouchNotice = '' // 修图注意事项
  retouchBackImgName = '' // 底色图
  retouchBackImg = '' // 底色图

  requireLabel = {} // 修图要求
  photoNum = 0 // 照片数据
  isGreen = false // 是否是绿色通道

  isChristmasPhoto = false

  retoucher = '' // 修图师
  retoucherJobNum = '' // 修图师id
  retoucherLeader = "" // 修图组长

  // 海草
  exp = 0 // 正常海草
  punishExp = 0 // 退回惩罚海草
  overtimeExp = 0 // 沙漏抽出海草
  rollbackExpRework = 0 // 退单回滚海草
  rollbackExpOvertime = 0 // 沙漏回滚海草
  actualExp = 0 // 实获海草
  timeIntervalRewardExp = 0 // 时段海草

  // 时间
  waitTime = '' // 流水号等待时间
  photographerUpdate = '' // 上传时间
  receiptAt = '-' // 接单时间
  passAt = '-' // 审核通过时间
  retouchAllTime = '-' // 修图总时长
  reviewTime = 0 // 审核时间
  hourGlassOverTime = '' // 沙漏结束时间 (分)

  // 门店退回相关
  isStoreReturn = false // 是否是门店退回
  isStoreReturned = false // 是否门店被退回
  storeReturnNum = 0 // 门店退回次数
  storeReturnTime = '-' // 门店退回时间
  lekimaCount = '-' // 利奇马樟树

  qualityNum = 0 // 正常流水门店退回质量问题张数
  notQualityNum = 0 // 正常流水门店退回非质量问题张数
  bothNum = 0 // 正常流水门店退回质量&非质量问题张数

  qualityNumForRework = 0 // 退回单门店退回质量问题张数
  notQualityNumForRework = 0 // 退回单门店退回非质量问题张数
  bothNumForRework = 0 // 退回单门店退回质量问题张数&非质量问题张数
  allReturnPhotoNum = 0 // 全部退单张数

  rollbackNumForRework = 0 // 回滚的单数

  reworkNum = 0

  // 评价相关
  goodEvaluate = '-'
  retoucherNpsAvg = '-'

  // 收益
  retouchIncome = 0 // 修图收益
  overtimeIncome = 0 // 超时惩罚收益
  rewordIncome = 0 // 奖励收益
  rollbackIncomeRework = 0 // 质量退单回滚收益
  rollbackIncomeOvertime = 0 // 沙漏超时回滚收益
  timeIntervalReward = 0 // 时段金币奖励
  punishIncome = 0 // 惩罚收益
  actualIncome = 0 // 实获收益

  // 云学院
  evaluationType = '' // 抽查类型
  evaluationTypeCN = '' // 抽查类型中文
  cloudEvaluateTime = '-' // 云学院评价时间

  // 申诉
  currentStreamAppeals = [] // 处在申诉状态的列表

  // 摄影机构信息
  photographerOrgName = '' // 摄影机构名称
  storeName = '' // 门店信息

  // 工作人员信息
  photographerName = '' // 摄影师名字

  // 产品信息
  productName = '' // 产品名称
  retouchStandard = '' // 产品修图标准

  // 沙漏信息
  hourGlassAllTime = '' // 沙漏总时长
  timeoutRollbackLog = '' // 沙漏回滚记录

  constructor (streamData) {
    if (!streamData) return

    this.baseData = streamData
    this.streamId = streamData.id || ''
    this.streamNum = streamData.stream_num || ''
    this.streamState = streamData.state || ''
    this.getReturnPhotoInfo()
    this.getNote()
    this.getTime()
    this.getIncome()
    this.getExp()
    const retouchRequire = {
      eye: '暂无',
      face: '暂无',
      pimples: false
    }
    this.requireLabel = _.get(streamData, 'tags.values.retouch_claim') || retouchRequire

    this.isCheckReturn = _.get(streamData, 'tags.statics', []).includes(STREAM_TAG.CHECKRETURN)
    this.reviewerNote = _.get(streamData, 'reviewer_note') || ''

    // 判断是否是圣诞一人成团订单
    this.isChristmasPhoto = _.get(streamData, 'tags.values.need_auto_created_finish_photo') || false

    const referencePhoto = _.get(streamData, 'tags.values.retouch_claim.referenceImg')
    this.referencePhoto = referencePhoto ? store.getters.imgDomain + referencePhoto : ''

    this.photoNum = this.getPhotoNum()
    this.isGreen = _.get(streamData, 'tags.statics', []).includes('green_stream')

    const retoucher = _.get(streamData, 'retoucher.name') || _.get(streamData, 'retoucher.real_name')
    const outRetoucher = _.get(streamData, 'tags.values.retoucher_name')
    this.retoucher = retoucher || outRetoucher || '-'
    this.retoucherJobNum = _.get(streamData, 'retoucher.id') || streamData.retoucher_id || '-'
    this.retoucherLeader = _.get(streamData, 'retoucher.retoucher_leader.nickname') ||
      _.get(streamData, 'retoucher.retoucher_leader.name') ||
      _.get(streamData, 'retoucher.retoucher_leader.real_name') || '-'

    this.isStoreReturn = _.get(streamData, 'tags.statics', []).includes(STREAM_TAG.STORERETURN)
    this.isStoreReturned = _.get(streamData, 'tags.statics', []).includes(STREAM_TAG.STORE_RETURNED)
    this.storeReturnNum = _.get(streamData, 'tags.values.store_rework_num') || 0
    this.storeReturnTime = _.get(streamData, 'tags.values.store_return_time') || '-'

    this.lekimaCount = _.get(streamData, 'tags.values.lichma_photo_num') || '-'
    this.goodEvaluate = _.get(streamData, 'store_evaluate_stream.store_evaluate') || '-'
    this.retoucherNpsAvg = _.get(streamData, 'tags.values.retoucher_score') || '-'

    // 云学院
    this.getEvaluationType(_.get(streamData, 'tags.statics', []))
    this.cloudEvaluateTime = _.get(streamData, 'tags.values.cloud_evaluate_time') || '-'

    // 申诉
    this.currentStreamAppeals = streamData.current_stream_appeals || []

    // 摄影机构信息
    this.photographerOrgName = _.get(streamData, 'order.photographer_org.name') || '-'
    this.storeName = _.get(streamData, 'order.tags.values.store_name') || '-'

    // 产品信息
    this.productName = _.get(streamData, 'product.name') || '-'
    this.retouchStandard = _.get(streamData, 'product.retouch_standard') || '-'

    // 工作人员
    this.photographerName = _.get(streamData, 'order.tags.values.photographer') || '-'

    this.reworkNum = _.get(streamData, 'tags.values.rework_num') || 0

    this.timeoutRollbackLog = streamData.timeout_rollback_log || ''
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

  getReturnPhotoInfo () {
    this.qualityNum = Number(_.get(this.baseData, 'tags.values.quality_num')) || 0
    this.notQualityNum = Number(_.get(this.baseData, 'tags.values.not_quality_num')) || 0
    this.bothNum = Number(_.get(this.baseData, 'tags.values.both_num')) || 0

    this.qualityNumForRework = Number(_.get(this.baseData, 'tags.values.quality_num_for_rework')) || 0
    this.notQualityNumForRework = Number(_.get(this.baseData, 'tags.values.not_quality_num_for_rework')) || 0
    this.bothNumForRework = Number(_.get(this.baseData, 'tags.values.both_num_for_rework')) || 0
    this.rollbackNumForRework = Number(_.get(this.baseData, 'tags.values.rollback_num_for_rework')) || 0

    this.allReturnPhotoNum = this.qualityNum +
      this.notQualityNum +
      this.bothNum +
      this.qualityNumForRework +
      this.notQualityNumForRework +
      this.bothNumForRework -
      this.rollbackNumForRework
  }

  // 获取收益
  getIncome () {
    const retouchIncome = Validate.toFixed(this.baseData.income) || 0 // 原始收益
    const overtimeIncome = Validate.toFixed(_.get(this.baseData, 'tags.values.overtime_income')) || 0
    const rewordIncome = Validate.toFixed(_.get(this.baseData, 'tags.values.reword')) || 0
    const rollbackIncomeRework = Validate.toFixed(_.get(this.baseData, 'tags.values.rollback_income_rework')) || 0
    const rollbackIncomeOvertime = Validate.toFixed(_.get(this.baseData, 'tags.values.rollback_income_overtime')) || 0
    // eslint-disable-next-line max-len
    // eslint-disable-next-line max-len
    const timeIntervalRewardIncome = Validate.toFixed(_.get(this.baseData, 'tags.values.time_interval_reward_income')) || 0
    const punishIncome = Validate.toFixed(_.get(this.baseData, 'tags.values.punish')) || 0

    const actualIncome = retouchIncome * 100 +
      rewordIncome * 100 -
      punishIncome *100 -
      overtimeIncome * 100 +
      timeIntervalRewardIncome * 100 +
      rollbackIncomeRework * 100 +
      rollbackIncomeOvertime * 100
    this.retouchIncome = retouchIncome
    this.overtimeIncome = overtimeIncome
    this.rewordIncome = rewordIncome
    this.rollbackIncomeRework = rollbackIncomeRework
    this.rollbackIncomeOvertime = rollbackIncomeOvertime
    this.timeIntervalRewardIncome = timeIntervalRewardIncome
    this.punishIncome = punishIncome
    this.actualIncome = Validate.toFixed(actualIncome / 100)
  }

  // 获取海草
  getExp () {
    this.exp = Validate.toFixed(this.baseData.exp) || 0
    this.punishExp = Validate.toFixed(_.get(this.baseData, 'tags.values.punish_exp')) || 0
    this.overtimeExp = Validate.toFixed(_.get(this.baseData, 'tags.values.overtime_exp')) || 0
    this.rollbackExpRework = Validate.toFixed(_.get(this.baseData, 'tags.values.rollback_exp_rework')) || 0
    this.rollbackExpOvertime = Validate.toFixed(_.get(this.baseData, 'tags.values.rollback_exp_overtime')) || 0
    this.timeIntervalRewardExp = Validate.toFixed(_.get(this.baseData, 'tags.values.time_interval_reward_exp')) || 0

    const actualExp =
      this.exp * 100 -
      this.overtimeExp * 100 -
      this.punishExp * 100 +
      this.timeIntervalRewardExp * 100 +
      this.rollbackExpRework * 100 +
      this.rollbackExpOvertime * 100
    this.actualExp = Validate.toFixed(actualExp / 100)
  }

  // 获取时间相关
  getTime () {
    this.photographerUpdate = this.baseData.created_at || '-'
    this.receiptAt = this.baseData.receipt_at || '-'
    this.passAt = this.baseData.pass_at || '-'
    this.waitTime = Validate.waitTime(this.baseData.created_at, this.baseData.pass_at)
    this.reviewTime = this.baseData.review_time || 0
    const hourGlassOverTime = _.get(this.baseData, 'hour_glass.over_time')
    this.hourGlassOverTime = hourGlassOverTime ? (hourGlassOverTime / 60).toFixed(2) : ''
    const retouchTime = _.get(this.baseData, 'retouch_time') || 0
    const reviewReturnRebuildTime = _.get(this.baseData, 'review_return_rebuild_time') || 0
    const allTime = retouchTime + reviewReturnRebuildTime
    this.retouchAllTime = (allTime / 60).toFixed(2) + 'min'
    const hourGlassAllTime = _.get(this.baseData, 'hour_glass.init_surplus_time') || 0
    this.hourGlassAllTime = ((hourGlassAllTime) / 60).toFixed(2) + 'min'
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
    this.retouchNotice = _.get(this.baseData, 'tags.values.retouch_remark') || '' // 修图注意事项
    this.retouchBackImgName = _.get(this.baseData, 'tags.values.retouch_color.name') || '' // 底色图
    this.retouchBackImg = _.get(this.baseData, 'tags.values.retouch_color.img_path') || '' // 底色地址
  }

  // 获取抽查类型
  getEvaluationType (statics = []) {
    const isCloudEvaluation = statics.includes('cloud_evaluation')
    // 进入抽片池就标识修修兽云学院记号
    if (statics.includes(SPOT_CHECK_MAP.SHOW_PIC_SPOT)) {
      this.evaluationType = SPOT_CHECK_MAP.SHOW_PIC_SPOT
      this.evaluationTypeCN = EVALUATION_TYPE[SPOT_CHECK_MAP.SHOW_PIC_SPOT]
      return
    }
    if (statics.includes(SPOT_CHECK_MAP.CHECK_POOL_SPOT)) {
      this.evaluationType = SPOT_CHECK_MAP.CHECK_POOL_SPOT
      this.evaluationTypeCN = EVALUATION_TYPE[SPOT_CHECK_MAP.CHECK_POOL_SPOT]
      return
    }
    // 兼容老数据
    if (isCloudEvaluation) {
      this.evaluationType = SPOT_CHECK_MAP.CHECK_POOL_SPOT
      this.evaluationTypeCN = EVALUATION_TYPE[SPOT_CHECK_MAP.CHECK_POOL_SPOT]
      return
    }
  }
}
