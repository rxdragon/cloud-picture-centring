import uuidv4 from 'uuid'

// 照片model
export default class PhotoModel {
  baseData = null
  id = ''
  isReturn = false // 是否审核退回
  isPull = false // 是否拔草
  isPlant = false // 是否种草
  originalPhoto = null // 原片信息
  firstPhoto = null // 第一次成片
  completePhoto = null // 云端成片
  grassReason = '' // 种草理由
  reworkReason = '' // 重修理由

  photoNum = 0 // 照片人数
 
  isStoreReturn = '' // 是否门店退回
  storeReworkReason = '' // 门店退回理由
  wholeReason = [] // 整体退回原因
  partReason = [] // 局部退回原因
  partNote = '' // 局部备注
  wholeNote = '' // 整体备注
  storeReworkNote = '' // 门店退回备注
  storePartReworkReason = [] // 退回标记
  storePartReworkReasonTags = [] // 全部退回标记
  qualityType = '' // 退单类型
  returnQualityType = '' // 被退标记
  isRollBack = false // 是否存在回滚收益
  originReworkPhotoLog = '' // 标记退回的log,存在才是门店标记退回的
  realReworkPhoto = {} // 被退回的照片version信息

  checkPoolScore = '' // 云学院抽片分数
  checkPoolTags = [] // 云学院标记
  checkEvaluator = '' // 打分人

  filmEvaluation = '' // 摄影评价

  constructor (photoData) {
    if (photoData instanceof Array) {
      photoData = {}
    }
    const labels = _.get( photoData, 'tags.values.labels', []) // 2.12之后才有labels
    const otherPhotoVersion = photoData.other_photo_version || []

    this.baseData = photoData
    this.id = photoData.id
    this.isReturn = _.get(photoData, 'tags.statics', []).includes('return_photo')
    this.isPull = _.get(photoData, 'tags.statics', []).includes('pull')
    this.isPlant = _.get(photoData, 'tags.statics', []).includes('plant')

    this.originalPhoto = otherPhotoVersion.find(item => item.version === 'original_photo') || {}
    this.firstPhoto = photoData.first_photo
    this.completePhoto = otherPhotoVersion.find(item => item.version === 'complete_photo') || {}

    this.grassReason = _.get(photoData, 'tags.values.grass_reason') || ''
    this.reworkReason = _.get(photoData, 'tags.values.rework_reason') || ''

    this.photoNum = _.get(photoData, 'people_num') || 0
    
    // 退单相关
    const statics = _.get(photoData, 'tags.statics') || []

    let realReworkPhoto = {}
    if (labels.length) {
      realReworkPhoto = otherPhotoVersion.find(photoVersion => {
        const isStoreRework = photoVersion.version === 'store_rework'
        const hasOriginReturnLabels = _.get(photoVersion, 'tags.values.origin_return_labels')
        return isStoreRework && hasOriginReturnLabels
      }) || {} // origin_return_labels 订单被推产生version 生成订单
    } else {
      realReworkPhoto = otherPhotoVersion.find(photoVersion => photoVersion.version === 'store_rework') || {}
    }

    this.qualityType = _.get(realReworkPhoto, 'tags.values.origin_return_labels.store_rework_type') || ''
    this.realReworkPhoto = realReworkPhoto
    // 获取被推信息
    this.getReturnQualityType()

    this.isStoreReturn = statics.includes('store_rework')
    this.isRollBack = statics.includes('return_rollback_all')
    this.originReworkPhotoLog = photoData.origin_rework_photo_log || ''
    this.storeReworkReason = _.get(photoData, 'tags.values.store_rework_reason') || ''
    if (labels.length) { // labels有的时候是新数据格式
      labels.forEach(labelsItem => {
        this.wholeReason.push(labelsItem.name)
      })
    } else {
      this.wholeReason = this.wholeReason.concat(this.storeReworkReason ? this.storeReworkReason.split('+') : [])
    }

    this.storeReworkNote = _.get(photoData, 'tags.values.store_rework_note') || '-'
    this.wholeNote = this.storeReworkNote
    this.storePartReworkReason = _.get(photoData, 'tags.values.store_part_rework_reason') || []
    this.storePartReworkReason.forEach(partReasonItem => {
      if (partReasonItem.labels) {
        this.partReason = this.partReason.concat(partReasonItem.labels.map(labelItem => labelItem.name))

      } else {
        this.partReason = [...partReasonItem.reason.split('+'), ...this.partReason]
      }
      this.partNote += partReasonItem.note
    })

    this.filmEvaluation = _.get(photoData, 'tags.values.film_evaluation') || ''
    this.getStoreReturnReason()
  }

  // 获取版本
  get photoVersion () {
    if (this.isReturn) {
      return [this.originalPhoto, this.firstPhoto, this.completePhoto]
    } else {
      return [this.originalPhoto, this.completePhoto]
    }
  }

  // 获取云学院抽片版本
  get photoSpotCheckVersion () {
    return [this.originalPhoto, this.firstPhoto]
  }

  getStoreReturnReason () {
    let storePartReworkReasonString = ''
    this.storePartReworkReason.forEach(item => {
      storePartReworkReasonString += `+${item.reason}`
    })
    this.storePartReworkReasonTags = storePartReworkReasonString.split('+')
    this.storePartReworkReasonTags.splice(0, 1)
  }

  // 获取云学院分数
  getCheckPoolTags () {
    this.checkPoolScore = _.get(this.baseData, 'tags.values.score') || ''
    this.checkEvaluator = _.get(this.baseData, 'tags.values.evaluator') || '-'
    const checkPoolTags = _.get(this.baseData, 'tags.values.check_pool_tags') || []
    const parentData = []
    checkPoolTags.forEach(issueItem => {
      const findClass = parentData.find(classItem => classItem.id === _.get(issueItem, 'parent.id'))
      if (findClass) {
        findClass.child.push({
          id: issueItem.id,
          name: issueItem.name
        })
      } else {
        const newClass = {
          id: _.get(issueItem, 'parent.id') || uuidv4(),
          name: _.get(issueItem, 'parent.name') || '-',
          child: [{
            id: issueItem.id,
            name: issueItem.name,
          }]
        }
        parentData.push(newClass)
      }
    })
    this.checkPoolTags = parentData
  }

  // 获取被退信息
  getReturnQualityType () {
    if (Object.values(this.realReworkPhoto).length) {
      const qualityType = _.get(this.realReworkPhoto, 'tags.values.origin_return_labels.store_rework_type') || ''
      this.returnQualityType = qualityType
    }
  }
}
