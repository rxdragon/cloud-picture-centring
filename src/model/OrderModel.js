
export default class OrderModel {
  baseData = null
  photographerName = '-' // 摄影机构名字
  photographer = '-' // 摄影机构名称
  dresserNote = '-' // 化妆备注
  orderNote = '-' // 订单备注
  constructor (orderData) {
    this.baseData = orderData
    this.photographerName = _.get(orderData, 'photographer_org.name') || '-'
    this.dresserNote = _.get(orderData, 'note.dresserNote') || '-'
    this.orderNote = _.get(orderData, 'note.orderNote') || '-'
  }
}
