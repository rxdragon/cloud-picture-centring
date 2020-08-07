import { AppealResultStatusEnum } from '@/utils/enumerate'

export default class PhotoAppealModel {
  base = {}
  id = ''
  createdAt = ''
  photoId = '' // 对应照片id
  desc = '' // 申诉理由
  firstResult = {
    result: '',
    resultDesc: '-'
  }
  secondResult = {
    result: '',
    resultDesc: '-',
    reason: '-'
  }

  constructor (photoAppeal) {
    this.base = photoAppeal
    this.id = photoAppeal.id
    this.createdAt = photoAppeal.created_at
    this.photoId = photoAppeal.photo_id
    this.desc = photoAppeal.desc
    if (photoAppeal.photo_appeal_examines[0]) {
      const streamAppealExamines = photoAppeal.photo_appeal_examines[0]
      this.firstResult.resultDesc = AppealResultStatusEnum[streamAppealExamines.result] || '-'
      this.firstResult.result = streamAppealExamines.result || ''
    }
    if (photoAppeal.photo_appeal_examines[1]) {
      const streamAppealExamines = photoAppeal.photo_appeal_examines[1]
      this.secondResult.resultDesc = AppealResultStatusEnum[streamAppealExamines.result] || '-'
      this.secondResult.reason = streamAppealExamines.reason || '-'
      this.secondResult.result = streamAppealExamines.result || ''
    }
  }
}
