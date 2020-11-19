import { AppealResultStatusPhotoEnum } from '@/utils/enumerate'

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
  checkPoolTags = []
  evaluatorType = ''
  checkPoolScore = '-'


  constructor (photoAppeal) {
    // 沙漏超时结果在stream_appeal_examines, 其他照片维度的在photo_appeal_examines
    const appealInfo = photoAppeal.stream_appeal_examines || photoAppeal.photo_appeal_examines || []
    const firstResultInfo = appealInfo[0]
    const secondResultInfo = appealInfo[1]

    this.base = photoAppeal
    this.id = photoAppeal.id
    this.createdAt = photoAppeal.created_at
    this.photoId = photoAppeal.photo_id
    this.desc = photoAppeal.desc
    this.appealResult = photoAppeal.extends
    if (firstResultInfo) {
      this.firstResult.resultDesc = AppealResultStatusPhotoEnum[firstResultInfo.result] || '-'
      this.firstResult.result = firstResultInfo.result || ''
      this.firstResult.reason = firstResultInfo.reason || '-'
    }
    if (secondResultInfo) {
      this.secondResult.resultDesc = AppealResultStatusPhotoEnum[secondResultInfo.result] || '-'
      this.secondResult.reason = secondResultInfo.reason || '-'
      this.secondResult.result = secondResultInfo.result || ''
    }
    this.getCheckPoolTags()
  }
  // 获取云学院分数
  getCheckPoolTags () {
    const tags = _.get(this.base, 'photo.tags.values')
    if (this.appealResult && tags) { // 如果有appealResult说明是历史快照,云学院评分情况下
      this.base.photo.tags.values = this.appealResult
    }
    this.checkPoolScore = _.get(this.base, 'photo.tags.values.score') || '-'
    this.evaluatorType = _.get(this.base, 'photo.tags.values.evaluator_type') || ''
    this.checkPoolTags = _.get(this.base, 'photo.tags.values.check_pool_tags') || []
  }
}
