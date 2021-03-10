/**
 * @description 产品分类模型
 */
export default class ProductClassificationListModel {
  baseData = null
  id = '' // 产品分类id
  keyId = '' // 用于表示的id
  classificationName = '' // 分类名称
  count = 0 // 产品数量
  createStaffName = '' // 创建人
  createTime = '' // 创建时间

  constructor (classificationList) {
    this.baseData = classificationList
    this.id = classificationList.id
    this.keyId = String(classificationList.id)
    this.classificationName = classificationList.name || ''
    this.count = classificationList.count || 0
    this.createTime = classificationList.create_time || ''
  }
}
