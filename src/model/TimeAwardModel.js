import { timeRewardTypeToCN, timeRewardStateToCN } from '@/utils/enumerate'

export default class TimeAwardModel {
  base = {}
  id = '' // id
  title = '' // 活动标题
  type = '' // 奖励设置类型
  typeStr = '' // 奖励设置中文
  state = '' // 活动状态
  stateStr = '' // 活动状态中文
  beginAt = '' // 活动开始时间
  endAt = '' // 活动结束时间
  rangeAt = '' // 活动时间范围
  creatorId = '' // 活动创建人id
  creatorName = '' // 活动创建人花名
  createdAt = '' // 活动创建时间
  staffs = [] // 活动生效的人员
  impulseSettingItems = [] // 冲量奖励内容
  rewardValue = '' // 经验/金币的倍数, 根据type判断展示

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
    this.creatorName = _.get(timeRewardItem, 'creator.nickname') || '-'
    this.createdAt = timeRewardItem.created_at || '-'
    this.staffs = timeRewardItem.staffs || []
    this.impulseSettingItems = timeRewardItem.impulse_setting_items || []
    this.rewardValue = timeRewardItem.value || ''
  }
}
