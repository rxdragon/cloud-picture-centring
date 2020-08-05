import axios from '@/plugins/axios.js'
import StreamModel from '@/model/StreamModel.js'
import { keyToHump } from '../utils'

/** 卡片配置 */

/**
 * @description 获取卡片配置列表
 * @param {*} params
 */
export function getStaffCardList (params) {
  return axios({
    url: '/project_cloud/config/getStaffCardList',
    method: 'POST',
    data: params
  }).then(msg => {
    msg.list.forEach(listItem => {
      listItem.staffName = _.get(listItem, 'staff.name') || _.get(listItem, 'staff.real_name') || '-'
      listItem.groupName = _.get(listItem, 'staff.retouch_group.name', '-')
      listItem.multiple = listItem.card.multiple
      listItem.createTime = listItem.card.created_at
      listItem.createStaff = listItem.card.founder_info ? listItem.card.founder_info.name : '-'
    })
    return msg
  })
}

/**
 * @description 删除卡片配置
 * @param {*} params
 */
export function deleteCard (params) {
  return axios({
    url: '/project_cloud/config/deleteCard',
    method: 'DELETE',
    params
  })
}

/**
 * @description 关闭卡片配置
 * @param {*} params
 */
export function closeCard (params) {
  return axios({
    url: '/project_cloud/config/closeCard',
    method: 'PUT',
    data: params
  })
}

/**
 * @description 添加卡片
 * @param {*} params
 */
export function addCard (params) {
  return axios({
    url: '/project_cloud/config/addCard',
    method: 'POST',
    data: params
  })
}

/** 冲量奖 */

/**
 * @description 获取冲量奖励列表
 * @param {*} params
 */
export function getImpulseList (params) {
  return axios({
    url: '/project_cloud/config/getImpulseList',
    method: 'POST',
    data: params
  }).then(msg => {
    msg.list.forEach(listItem => {
      listItem.createName = listItem.founder_info ? listItem.founder_info.name : '-'
    })
    return msg
  })
}

/**
 * @description 获取冲量奖详情
 * @param {*} params
 */
export function getImpulseInfo (params) {
  return axios({
    url: 'project_cloud/config/getImpulseInfo',
    method: 'GET',
    params
  }).then(msg => {
    const retoucherOrg = msg.retoucher_org.map(item => item.name)
    msg.retoucherOrg = retoucherOrg.join('，')
    return msg
  })
}

/**
 * @description 删除冲量奖励
 */
export function deleteImpulse (params) {
  return axios({
    url: '/project_cloud/config/deleteImpulse',
    method: 'DELETE',
    params
  })
}

/**
 * @description 提前结束
 */
export function disableImpulse (params) {
  return axios({
    url: '/project_cloud/config/disableImpulse',
    method: 'POST',
    data: params
  })
}

/**
 * @description 添加冲量奖
 * @param {*} params
 */
export function addImpulse (params) {
  return axios({
    url: '/project_cloud/config/addImpulse',
    method: 'POST',
    data: params
  })
}

/**
 * @description 删除冲量奖励配置
 * @param {*} params
 */
export function delImpulseSettingItem (params) {
  return axios({
    url: '/project_cloud/config/delImpulseSettingItem',
    method: 'DELETE',
    params
  })
}

/**
 * @description 获取冲量奖励配置项列表
 * @param {*} params
 */
export function getImpulseSettingItemList (params) {
  return axios({
    url: '/project_cloud/config/getImpulseSettingItemList',
    method: 'GET',
    data: params
  }).then(msg => {
    const data = msg.sort((a, b) => a.reach_exp - b.reach_exp)
    return data
  })
}

/**
 * @description 添加冲量奖励配置
 * @param {*} params
 */
export function addImpulseSettingItem (params) {
  return axios({
    url: '/project_cloud/config/addImpulseSettingItem',
    method: 'POST',
    data: params
  })
}

/** 绿色通道 */

/**
 * @description 获取绿色通道
 * @param {*} params
 */
export function getGreenChannelInfo (params) {
  return axios({
    url: '/project_cloud/config/getGreenChannelInfo',
    method: 'GET'
  }).then(msg => {
    return msg
  })
}

/**
 * @description 更新绿色通道
 * @param {*} params
 */
export function saveGreenChannelInfo (params) {
  return axios({
    url: '/project_cloud/config/saveGreenChannelInfo',
    method: 'PUT',
    data: params
  })
}

/** 沙漏时间 */

/**
 * @description 关闭全局沙漏状态
 * @param {*} params
 */
export function disableHourGlassGlobalState () {
  return axios({
    url: '/project_cloud/config/disableHourGlassGlobalState',
    method: 'PUT'
  })
}

/**
 * @description 开启全局沙漏状态
 * @param {*} params
 */
export function enableHourGlassGlobalState () {
  return axios({
    url: '/project_cloud/config/enableHourGlassGlobalState',
    method: 'PUT'
  })
}

/**
 * @description 获取沙漏列表
 * @param {*} params
 */
export function getHourGlassList (params) {
  return axios({
    url: '/project_cloud/config/getHourGlassList',
    method: 'GET',
    params
  }).then(msg => {
    msg.list.forEach(listItem => {
      let productNameArr = []
      listItem.hour_glass_setting_products.forEach(productItem => {
        const pushData = _.get(productItem, 'product.name', '-')
        productNameArr = [...productNameArr, pushData]
      })
      listItem.productName = productNameArr.join(',')
      listItem.baseTime = listItem.base_time + 'min'
      listItem.superimposedTime = listItem.superimposed_time + 'min / 人'
      listItem.hour_glass_setting_products.forEach(productItem => {
        productItem.retouch_standard && (listItem.retouch_standard = productItem.retouch_standard)
      })
      listItem.range = listItem.hour_glass_setting_staff_entry_tags.map(item => item.entry_tag)
      listItem.retouchStandard = listItem.hour_glass_setting_product_retouch_standard.retouch_standard
    })
    return msg
  })
}

/**
 * @description 获取基础沙漏列表
 * @param {*} params
 */
export function getBaseHourGlassSetting () {
  return axios({
    url: '/project_cloud/config/getBaseHourGlassSetting',
    method: 'GET'
  }).then(msg => {
    msg.list.forEach(listItem => {
      listItem.baseTime = listItem.base_time + 'min'
      listItem.deleteId = listItem.id
      listItem.superimposedTime = listItem.superimposed_time + 'min / 人'
      listItem.range = listItem.hour_glass_setting_staff_entry_tags.map(item => item.entry_tag)
      listItem.retouchStandard = _.get(listItem, 'hour_glass_setting_product_retouch_standard.retouch_standard', '')
    })
    return msg
  })
}

/**
 * @description 删除沙漏
 * @param {*} params
 */
export function deleteHourGlass (params) {
  return axios({
    url: '/project_cloud/config/DeleteHourGlass',
    method: 'DELETE',
    params
  })
}

/**
 * @description 添加沙漏
 * @param {*} params
 */
export function addHourGlass (params) {
  return axios({
    url: '/project_cloud/config/addHourGlass',
    method: 'POST',
    data: params
  })
}

/**
 * @description 编辑
 * @param {*} params
 */
export function editHourGlass (params) {
  return axios({
    url: '/project_cloud/config/editHourGlass',
    method: 'PUT',
    data: params
  })
}

/**
 * @description 获取沙漏详情
 * @param {*} params
 */
export function getHourGlassInfo (params) {
  return axios({
    url: '/project_cloud/config/getHourGlassInfo',
    method: 'GET',
    params
  }).then(msg => {
    const data = JSON.parse(JSON.stringify(msg))
    data.productValue = []
    data.productClass = data.hourGlassSettingProductRetouchStandard.retouch_standard
    data.hour_glass_setting_products.forEach(productItem => {
      data.productValue.push(productItem.product_id)
    })
    data.range = data.hour_glass_setting_staff_entry_tags.map(item => item.entry_tag)
    return data
  })
}

/** 产品 */

/**
 * @description 获取产品列表
 * @param {*} params
 */
export function getProductList (params) {
  return axios({
    url: '/project_cloud/product/getProductList',
    method: 'POST',
    data: params
  }).then(msg => {
    msg.item.forEach(listItem => {
      listItem.photographerOrgName = listItem.photographer_org ? listItem.photographer_org.name : '-'
    })
    return msg
  })
}

/**
 * @description 删除产品
 * @param {*} params
 */
export function delProduct (params) {
  return axios({
    url: '/project_cloud/product/delProduct',
    method: 'DELETE',
    params
  })
}

/**
 * @description 获取产品详情
 * @param {*} params
 */
export function getProductInfo (params) {
  return axios({
    url: '/project_cloud/product/getProductInfo',
    method: 'GET',
    params
  }).then(msg => {
    const data = keyToHump(msg)
    data.simpleImages = data.simpleImages.filter(item => item !== 'null')
    return data
  })
}

/**
 * @description 审核拒绝
 * @param {*} params
 */
export function refuseProduct (params) {
  return axios({
    url: '/project_cloud/product/refuseProduct',
    method: 'POST',
    data: params
  })
}

/**
 * @description 审核通过
 * @param {*} params
 */
export function passProduct (params) {
  return axios({
    url: '/project_cloud/product/passProduct',
    method: 'PUT',
    data: params
  })
}

/**
 * @description 修改产品
 * @param {*} params
 */
export function editProduct (params) {
  return axios({
    url: '/project_cloud/product/editProduct',
    method: 'PUT',
    data: params
  })
}

/**
 * @description 云端全流水查询
 * @param {*} params 
 */
export function getAllCloudStream (params) {
  return axios({
    url: '/project_cloud/operator/getAllCloudStream',
    method: 'POST',
    data: params
  }).then(msg => {
    msg.list = msg.list.map(item => {
      return {
        ...new StreamModel(item)
      }
    })
    return msg
  })
}
