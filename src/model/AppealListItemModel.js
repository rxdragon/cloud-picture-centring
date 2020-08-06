import store from '@/store' // vuex

import { AppealTypeNameEnum, AppealStreamStatusEnum, AppealCheckStatusEnum, APPEAL_STREAM_STATUS } from '@/utils/enumerate'

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
  state = '' // 审核进度状态
  isSelfFirst = true // 判断初审人是否是自己
  isSelfSecond = true // 判断复审人是否是自己
  isFirstChecking = false // 处于初审中
  isSecondChecking = false // 处于复审中
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
      const streamAppealExamines = appealItem.stream_appeal_examines[0]
      this.firstInfo = {
        staffName: _.get(streamAppealExamines, 'examine_staff_info.name', '--'),
        status: AppealCheckStatusEnum[streamAppealExamines.state] || '--',
        time: streamAppealExamines.finish_at || '--'
      }
      this.isSelfFirst = streamAppealExamines.examine_staff_id === store.getters.userInfo.id
    }
    if (appealItem.stream_appeal_examines[1]) {
      const streamAppealExamines = appealItem.stream_appeal_examines[1]
      this.secondInfo = {
        staffName: _.get(streamAppealExamines, 'examine_staff_info.name', '--'),
        status: AppealCheckStatusEnum[streamAppealExamines.state] || '--',
        time: streamAppealExamines.finish_at || '--'
      }
      this.isSelfSecond = streamAppealExamines.examine_staff_id === store.getters.userInfo.id
    }
    this.state = appealItem.state
    if (appealItem.state === APPEAL_STREAM_STATUS.FIRST_EXAMINE) this.isFirstChecking = true
    if (appealItem.state === APPEAL_STREAM_STATUS.SECOND_EXAMINE) this.isSecondChecking = true
  }
}
