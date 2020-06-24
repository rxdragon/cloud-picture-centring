
import * as Validate from '@/utils/validate.js'

export default class PerformanceModel {
  base = {}
  id = 0 // 激励id
  name = '-' // 名字
  nickname = '-' // 花名
  jobNumber = '-' // 工号
  performanceScode = 0 // 绩效得分
  createdAt = '-' // 创建使劲啊
  updatedAt = '-' // 最后更新时间

  constructor (performanceData) {
    this.base = performanceData
    this.id = _.get(performanceData, 'id') || 0
    this.name = _.get(performanceData, 'staffInfo.name') || '-'
    this.nickname = _.get(performanceData, 'staffInfo.nickname') || '-'
    this.jobNumber = _.get(performanceData, 'staffInfo.id') || '-'
    this.performanceScode = _.get(performanceData, 'value') || 0
    this.performanceScode = Validate.toFixed(this.performanceScode)
    this.createdAt = _.get(performanceData, 'created_at') || '-'
    this.updatedAt = _.get(performanceData, 'updated_at') || '-'
  }
}
