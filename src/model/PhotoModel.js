import uuidv4 from 'uuid'

// 照片model
export default class PhotoModel {
  baseData = null
  id = ''
  isReturn = false // 是否审核退回
  isPull = false // 是否拔草
  isPlant = false // 是否种草
  originalPhoto = '' // 原片信息
  firstPhoto = '' // 第一次成片
  completePhoto = '' // 云端成片
  grassReason = '' // 种草理由
  reworkReason = '' // 重修理由
 
  isStoreReturn = '' // 是否门店退回
  storeReworkReason = '' // 门店退回理由
  storeReworkNote = '' // 门店退回备注
  storePartReworkReason = [] // 退回标记
  storePartReworkReasonTags = [] // 全部退回标记

  checkPoolScore = '' // 云学院抽片分数
  checkPoolTags = [] // 云学院标记
  checkEvaluator = '' // 打分人

  constructor (photoData) {
    if (photoData instanceof Array) {
      photoData = {}
    }
    this.baseData = photoData
    this.id = photoData.id
    this.isReturn = _.get(photoData, 'tags.statics', []).includes('return_photo')
    this.isPull = _.get(photoData, 'tags.statics', []).includes('pull')
    this.isPlant = _.get(photoData, 'tags.statics', []).includes('plant')

    const otherPhotoVersion = photoData.other_photo_version || []
    this.originalPhoto = otherPhotoVersion.find(item => item.version === 'original_photo') || {}
    this.firstPhoto = photoData.first_photo
    this.completePhoto = otherPhotoVersion.find(item => item.version === 'complete_photo') || {}
    if (this.completePhoto) {
      const findLastRetouchPhoto = otherPhotoVersion.find(item => item.version === 'last_retouch_photo')
      if (findLastRetouchPhoto) { findLastRetouchPhoto.version = 'complete_photo' }
      this.completePhoto = findLastRetouchPhoto || this.completePhoto
    }

    this.grassReason = _.get(photoData, 'tags.values.grass_reason') || ''
    this.reworkReason = _.get(photoData, 'tags.values.rework_reason') || ''

    // 退单相关
    const statics = _.get(photoData, 'tags.statics') || []
    this.isStoreReturn = statics.includes('store_rework')
    this.storeReworkReason = _.get(photoData, 'tags.values.store_rework_reason') || '-'
    this.storeReworkNote = _.get(photoData, 'tags.values.store_rework_note') || '-'
    this.storePartReworkReason = _.get(photoData, 'tags.values.store_part_rework_reason') || []
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
    this.checkPoolScore = _.get(this.baseData, 'tags.values.score')
    this.checkPoolScore = Number(this.checkPoolScore) === 0 ? 0 : '-'
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
}
