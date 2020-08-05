import { AppealTypeNameEnum, AppealStreamStatusEnum, AppealCheckStatusEnum } from '@/utils/enumerate'

export default class AppealListItemModel {
  id = ''
  streamId = ''
  streamNum = ''
  createdAt = '' // 申诉时间
  appealTypeName = '' // 申诉类型
  appealStatusDesc = '' // 审核进度
  firstInfo = { // 初审信息
    staffName: '--',
    status: '--',
    time: '--'
  }
  secondInfo = { // 复审信息
    staffName: '--',
    status: '--',
    time: '--'
  }
  baseData = {}

  constructor (appealItem) {
    this.baseData = appealItem
    this.streamId = appealItem.stream_id
    this.id = appealItem.id
    this.streamNum = _.get(appealItem, 'stream.stream_num', '')
    this.createdAt = appealItem.created_at
    this.appealTypeName = AppealTypeNameEnum[appealItem.type]
    this.appealStatusDesc = AppealStreamStatusEnum[appealItem.state]
    if (appealItem.stream_appeal_examines[0]) {
      this.firstInfo = {
        staffName: _.get(appealItem.stream_appeal_examines[0], 'examine_staff_info.name', '--'),
        status: AppealCheckStatusEnum[appealItem.stream_appeal_examines[0].state] || '--',
        time: appealItem.stream_appeal_examines[0].finish_at || '--'
      }
    }
    if (appealItem.stream_appeal_examines[1]) {
      this.secondInfo = {
        staffName: _.get(appealItem.stream_appeal_examines[1], 'examine_staff_info.name', '--'),
        status: AppealCheckStatusEnum[appealItem.stream_appeal_examines[1].state] || '--',
        time: appealItem.stream_appeal_examines[1].finish_at || '--'
      }
    }
  }
}
