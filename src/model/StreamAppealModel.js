import store from '@/store' // vuex

import {
  AppealTypeNameEnum,
  AppealStreamStatusEnum,
  AppealResultStatusEnum,
  APPEAL_STREAM_STATUS
} from '@/utils/enumerate'

export default class StreamAppealModel {
  base = {}
  id = ''
  desc = ''
  streamId = ''
  streamNum = ''
  createdAt = '' // 申诉时间
  appealType = '' // 申诉类型
  appealTypeName = '' // 申诉类型中文
  appealStatusDesc = '' // 审核进度
  firstInfo = { // 初审信息
    staffName: '-',
    status: '-',
    time: '-'
  }
  secondInfo = { // 复审信息
    staffName: '-',
    status: '-',
    time: '-'
  }
  state = '' // 审核进度状态
  isSelfFirst = true // 判断初审人是否是自己
  isSelfSecond = true // 判断复审人是否是自己
  isFirstChecking = false // 处于初审中
  isSecondChecking = false // 处于复审中
  isFinished = false // 是否申诉已经完结

  appealNickName = '-' // 申诉申请人
  appealGroupName = '-' // 申诉申请人所属组名

  constructor (appealItem) {
    const appealInfo = appealItem.stream_appeal_examines || []
    const firstCheckInfo = appealInfo[0]
    const secondCheckInfo = appealInfo[1]
    const appealIsFinsh = appealItem.state === APPEAL_STREAM_STATUS.FINISH
    const appealIsExpire = appealItem.state === APPEAL_STREAM_STATUS.EXPIRE
    const appealIsFirstExamine = appealItem.state === APPEAL_STREAM_STATUS.FIRST_EXAMINE
    const appealIsSecondExamine = appealItem.state === APPEAL_STREAM_STATUS.SECOND_EXAMINE
    this.base = appealItem
    this.streamId = appealItem.stream_id
    this.id = appealItem.id
    this.desc = appealItem.desc
    this.streamNum = _.get(appealItem, 'stream.stream_num') || ''
    this.createdAt = appealItem.created_at
    this.appealType = appealItem.type
    this.appealTypeName = AppealTypeNameEnum[appealItem.type]
    this.appealStatusDesc = AppealStreamStatusEnum[appealItem.state]
    if (firstCheckInfo) {
      this.firstInfo = {
        staffName: _.get(firstCheckInfo, 'examine_staff_info.nickname') || '-',
        status: AppealResultStatusEnum[firstCheckInfo.state] || '-',
        time: firstCheckInfo.finish_at || '-'
      }
      this.isSelfFirst = firstCheckInfo.examine_staff_id === store.getters.userInfo.id
    }
    if (secondCheckInfo) {
      this.secondInfo = {
        staffName: _.get(secondCheckInfo, 'examine_staff_info.nickname') || '-',
        status: AppealResultStatusEnum[secondCheckInfo.state] || '-',
        time: secondCheckInfo.finish_at || '-'
      }
      this.isSelfSecond = secondCheckInfo.examine_staff_id === store.getters.userInfo.id
    }
    this.state = appealItem.state
    if (appealIsFirstExamine) this.isFirstChecking = true
    if (appealIsSecondExamine) this.isSecondChecking = true
    if (appealIsFinsh || appealIsExpire) this.isFinished = true

    this.appealNickName = _.get(appealItem, 'appeal_staff_info.nickname') || '-'
    this.appealGroupName = _.get(appealItem, 'appeal_staff_info.group_info.name') || '-'
  }
}
