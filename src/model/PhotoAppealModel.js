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


  constructor (photoAppeal) {
    // todo mock
    photoAppeal.tags = {}
    photoAppeal.tags.values = {}
    photoAppeal.tags.values.score = 39
    photoAppeal.tags.values.evaluator_type = 'pull'

    photoAppeal.tags.values.check_pool_tags = [
      {
        "id": 91,
        "name": "身型/脖子",
        "parent_id": 87,
        "parent": {
          "id": 87,
          "name": "液化拔草扣分项目"
        }
      },
      {
        "id": 94,
        "name": "磨皮过/不足/平/脏",
        "parent_id": 93,
        "parent": {
          "id": 93,
          "name": "磨皮拔草扣分项"
        }
      }
    ]

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
    this.checkPoolScore = _.get(this.base, 'tags.values.score') || '-'
    this.evaluatorType = _.get(this.base, 'tags.values.evaluator_type') || ''
    this.checkPoolTags = _.get(this.base, 'tags.values.check_pool_tags') || []
  }
}
