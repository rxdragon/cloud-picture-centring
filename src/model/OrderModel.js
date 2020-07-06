
export default class OrderModel {
  baseData = null
  id = '' // 订单id
  photographerName = '-' // 摄影机构名字
  photographer = '-' // 摄影机构名称
  dresserNote = '-' // 化妆备注
  orderNote = '-' // 订单备注
  photographerStaffName = '-' // 摄影师名字

  externalNum = '-' // 订单信息
  storeName = '-' // 门店信息

  constructor (orderData) {
    this.baseData = orderData
    this.id = orderData.id

    this.photographerName = _.get(orderData, 'photographer_org.name') || '-'
    this.dresserNote = _.get(orderData, 'note.dresserNote') || '-'
    this.orderNote = _.get(orderData, 'note.orderNote') || '-'
    this.photographerStaffName = _.get(orderData, 'tags.values.photographer') || '-' // 摄影师名字

    this.externalNum = _.get(orderData, 'external_num') || '-'
    this.storeName = _.get(orderData, 'tags.values.store_name') || '-'
  }
}
