
export default class PhotoAppealModel {
  id = ''
  createdAt = ''
  photoId = '' // 对应照片id
  desc = '' // 申诉理由
  baseData = {}

  constructor (photoAppeal) {
    this.baseData = photoAppeal
    this.id = photoAppeal.id
    this.createdAt = photoAppeal.created_at
    this.photoId = photoAppeal.photo_id
    this.desc = photoAppeal.desc
  }
}
