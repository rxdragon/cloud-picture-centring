import { AppealResultStatusEnum } from '@/utils/enumerate'

export default class PhotoAppealModel {
  base = {}
  id = ''
  createdAt = ''
  photoId = '' // 对应照片id
  desc = '' // 申诉理由
  appealResult = null // 申诉快照,本次申诉的申诉结果
  firstResult = { // 初审结果
    reason: '-',
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
    const firstResultInfo = appealInfo[0]
    const secondResultInfo = appealInfo[1]

    this.base = photoAppeal
    this.id = photoAppeal.id
    this.createdAt = photoAppeal.created_at
    this.photoId = photoAppeal.photo_id
    this.desc = photoAppeal.desc
    this.appealResult = photoAppeal.extends
    if (firstResultInfo) {
      this.firstResult.resultDesc = AppealResultStatusEnum[firstResultInfo.result] || '-'
      this.firstResult.result = firstResultInfo.result || ''
      this.firstResult.reason = firstResultInfo.reason || '-'
    }
    if (secondResultInfo) {
      this.secondResult.resultDesc = AppealResultStatusEnum[secondResultInfo.result] || '-'
      this.secondResult.reason = secondResultInfo.reason || '-'
      this.secondResult.result = secondResultInfo.result || ''
    }
  }
}
