import { AppealResultStatusEnum } from '@/utils/enumerate'

export default class PhotoAppealModel {
  base = {}
  id = ''
  createdAt = ''
  photoId = '' // 对应照片id
  desc = '' // 申诉理由
  firstResult = { // 初审结果
    result: '',
    resultDesc: '-'
  }
  secondResult = { // 复审结果
    result: '',
    resultDesc: '-',
    reason: '-'
  }

  constructor (photoAppeal) {
    const appealInfo = photoAppeal.photo_appeal_examines || []
    this.base = photoAppeal
    this.id = photoAppeal.id
    this.createdAt = photoAppeal.created_at
    this.photoId = photoAppeal.photo_id
    this.desc = photoAppeal.desc
    if (appealInfo[0]) {
      const streamAppealExamines = appealInfo[0]
      this.firstResult.resultDesc = AppealResultStatusEnum[streamAppealExamines.result] || '-'
      this.firstResult.result = streamAppealExamines.result || ''
    }
    if (appealInfo[1]) {
      const streamAppealExamines = appealInfo[1]
      this.secondResult.resultDesc = AppealResultStatusEnum[streamAppealExamines.result] || '-'
      this.secondResult.reason = streamAppealExamines.reason || '-'
      this.secondResult.result = streamAppealExamines.result || ''
    }
  }
}
