import { timeRewardTypeToCN, timeRewardStateToCN } from '@/utils/enumerate'

export default class TimeAwardModel {
  base = {}
  id = ''
  title = ''
  type = ''
  typeStr = ''
  state = ''
  stateStr = ''
  beginAt = ''
  endAt = ''
  rangeAt = ''
  creatorId = ''
  creatorName = ''
  configItems = [] // todo 待定
  createdAt = ''
  updatedAt = ''

  constructor (timeRewardItem) {
    this.base = timeRewardItem
    this.id = timeRewardItem.id || ''
    this.title = timeRewardItem.title || '-'
    this.type = timeRewardItem.type || ''
    this.typeStr = timeRewardTypeToCN[this.type] || '-'
    this.state = timeRewardItem.state || ''
    this.stateStr = timeRewardStateToCN[this.state] || '-'
    this.beginAt = timeRewardItem.begin_at || '-'
    this.endAt = timeRewardItem.end_at || '-'
    this.rangeAt = `${this.beginAt} - ${this.endAt}`
    this.creatorId = timeRewardItem.creator_id || ''
    this.creatorName = _.get(timeRewardItem, 'creator.name') || '-'
    this.configItems = timeRewardItem.config_items || []
    this.createdAt = timeRewardItem.created_at || '-'
    this.updatedAt = timeRewardItem.updated_at || '-'
  }
}
