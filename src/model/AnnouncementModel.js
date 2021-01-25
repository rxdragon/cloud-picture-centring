import { announcementToCN, announcementPeopleToCN } from '@/utils/enumerate.js'
/**
 * @description 公告模型
 */
export default class AnnouncementModel {
  id = '' // 公告id
  title = '' // 公告标题
  type = '' // 公告类型
  typeCN = '' // 公告类型中文字段
  content = '' // 公告内容
  creatorId = '' // 公告创建人id
  creatorName = '' // 创建人名字
  receiverType = '' // 通知人员类型
  receiverTypeCN = '' // 通知人员类型中文
  brief = '' // 公告简介
  files = [] // 文件类型
  unreadCount = 0 // 未读人数
  readCount = 0 // 已读人数

  createdAt = '' // 创建时间
  receiverTime = '' // 通知时间

  constructor (announcementData) {
    this.id = announcementData.id
    this.title = announcementData.title

    this.type = announcementData.type
    this.typeCN = announcementToCN[this.type]

    this.creatorId = announcementData.creator_id
    this.creatorName = _.get(announcementData, 'creator.nickname') || _.get(announcementData, 'creator.name') || '-'

    this.receiverType = announcementData.receiver_type
    this.receiverTypeCN = announcementPeopleToCN[this.receiverType] || ''
    this.createdAt = announcementData.created_at || '异常'
    this.receiverTime = announcementData.send_at || '异常'

    this.files = announcementData.files || []
    this.content = announcementData.content || '异常'
    this.brief = announcementData.brief || '异常'

    this.unreadCount = _.get(announcementData, 'unread_count') || 0
    this.readCount = _.get(announcementData, 'read_count') || 0
  }
}
