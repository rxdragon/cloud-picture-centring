
export default class OrderModel {
  baseData = null
  photographerName = '-' // 摄影机构名字
  photographer = '-' // 摄影机构名称
  constructor (orderData) {
    this.baseData = orderData
    this.photographerName = _.get(orderData, 'photographer_org.name') || '-'
  }
}
