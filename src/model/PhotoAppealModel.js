import * as PhotoTool from '@/utils/photoTool.js'
import { AppealResultStatusPhotoEnum } from '@/utils/enumerate'

// 照片申述记录
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
  oldCheckPoolTags = []
  oldCheckPoolScore = ''
  newCheckPoolTags = []
  newCheckPoolScore = ''


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
    // 如果有appealResult说明是历史快照,云学院评分情况下
    if (this.appealResult && tags) {
      this.base.photo.tags.values = this.appealResult
      this.oldCheckPoolScore = _.get(this.appealResult, 'old_check_pool_history.score', '')
      this.oldCheckPoolScore = String(this.oldCheckPoolScore)
      const oldCheckPoolTags = _.get(this.appealResult, 'old_check_pool_history.check_pool_tags') || []
      const oldCommitInfo = PhotoTool.handleCommitInfo({}, oldCheckPoolTags)
      this.oldCheckPoolTags = oldCommitInfo.issueLabel

      this.newCheckPoolScore = _.get(this.appealResult, 'new_check_pool_history.score', '')
      this.newCheckPoolScore = String(this.newCheckPoolScore)
      const newCheckPoolTags = _.get(this.appealResult, 'new_check_pool_history.check_pool_tags') || []
      const newCommitInfo = PhotoTool.handleCommitInfo({}, newCheckPoolTags)
      this.newCheckPoolTags = newCommitInfo.issueLabel
    } else {
      this.oldCheckPoolScore = _.get(tags, 'score', '')
      this.oldCheckPoolScore = String(this.oldCheckPoolScore)
      const oldCheckPoolTags = _.get(this.appealResult, 'check_pool_tags') || []
      const oldCommitInfo = PhotoTool.handleCommitInfo({}, oldCheckPoolTags)
      this.oldCheckPoolTags = oldCommitInfo.issueLabel
    }
  }
}
