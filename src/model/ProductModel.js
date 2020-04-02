/**
 * @property {Number} id 产品id
 * @property {String} productName 产品名称
 */
export default class ProductModel {
  baseData = null
  id = ''
  productName = ''

  constructor (productData) {
    if (!productData) return
    this.baseData = productData
    this.id = productData.id || ''
    this.productName = productData.name || ''
    this.type = productData.retouch_standard || ''
  }
}
