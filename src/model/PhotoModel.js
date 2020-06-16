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
  
  constructor (photoData) {
    this.baseData = photoData
    this.id = photoData.id
    this.isReturn = _.get(photoData, 'tags.statics', []).includes('return_photo')
    this.isPull = _.get(photoData, 'tags.statics', []).includes('pull')
    this.isPlant = _.get(photoData, 'tags.statics', []).includes('plant')
    this.originalPhoto = photoData.other_photo_version.find(item => item.version === 'original_photo')
    this.firstPhoto = photoData.first_photo
    this.completePhoto = photoData.other_photo_version.find(item => item.version === 'complete_photo')
    if (this.completePhoto) {
      this.completePhoto = photoData.other_photo_version.find(item => item.version === 'last_retouch_photo')
    }
    this.grassReason = _.get(photoData, 'tags.values.grass_reason') || ''
    this.reworkReason = _.get(photoData, 'tags.values.rework_reason') || ''
  }

  // 获取版本
  get photoVersion () {
    if (this.isReturn) {
      return [this.originalPhoto, this.firstPhoto, this.completePhoto]
    } else {
      return [this.originalPhoto, this.completePhoto]
    }
  }
}
