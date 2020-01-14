import axios from '@/plugins/axios.js'
import { keyToHump } from '@/utils'
import { toNumber } from '@/utils/validate'

/**
 * @description 获取修图机构
 */
export function getRetoucherOrg () {
  return axios({
    url: '/project_cloud/common/getRetoucherOrg',
    method: 'get'
  }).then(res => {
    const createData = []
    res.forEach(item => {
      createData.push({
        value: Number(item.id),
        label: item.name
      })
    })
    return createData
  })
}

/**
 * @description 获取摄影机构
 */
export function getPhotographerOrg () {
  return axios({
    url: '/project_cloud/common/getPhotographerOrg',
    method: 'get'
  }).then(res => {
    const createData = []
    res.forEach(item => {
      createData.push({
        value: Number(item.id),
        label: item.name
      })
    })
    return createData
  })
}

/**
 * @description 获取修图机构
 */
export function getRetouchOrgList () {
  return axios({
    url: '/project_cloud/operator/getRetouchOrgList',
    method: 'GET'
  }).then(msg => {
    msg.forEach(listItem => {
      listItem.subAccountCount = listItem.sub_account_count || '-'
    })
    return msg
  })
}

/**
 * @description 添加修图机构
 */
export function addRetouchOrg (params) {
  return axios({
    url: '/project_cloud/operator/addRetouchOrg',
    method: 'POST',
    data: params
  })
}

/**
 * @description 获取摄影机构列表
 */
export function getPhotographerOrgList () {
  return axios({
    url: '/project_cloud/operator/getPhotographerOrgList',
    method: 'GET'
  }).then(msg => {
    msg.forEach(item => {
      item.loginType = item.type === 'api' ? '直接通信' : '账号密码登录'
      item.viscountNum = '-'
    })
    return msg
  })
}

/**
 * @description 启用修图机构
 * @param {*} params
 */
export function enableRetouchOrg (params) {
  return axios({
    url: '/project_cloud/operator/enableRetouchOrg',
    method: 'PUT',
    data: params
  })
}

/**
 * @description 禁用修图机构
 * @param {*} params
 */
export function disableRetouchOrg (params) {
  return axios({
    url: '/project_cloud/operator/disableRetouchOrg',
    method: 'PUT',
    data: params
  })
}

/**
 * @description 获取修图机构信息
 * @param {*} params
 */
export function getRetouchOrgInfo (params) {
  return axios({
    url: '/project_cloud/operator/getRetouchOrgInfo',
    method: 'GET',
    params
  }).then(msg => {
    const data = keyToHump(msg)
    const createData = {}
    createData.institutionConfig = {
      name: data.name,
      code: data.code,
      account: data.account,
      secret: '',
      incomeConfig: data.incomeConfig
    }
    createData.defaultCheckedKeys = data.canReceiveProduct.map(productItem => productItem.id)
    return createData
  })
}

/**
 * @description 获取修图机构绩效
 * @param {*} params
 */
export function getRetouchOrgIncome (params) {
  return axios({
    url: '/project_cloud/operator/getRetouchOrgIncome',
    method: 'GET',
    params
  }).then(msg => {
    const createData = msg.map(listItem => {
      listItem = toNumber(listItem)
      const deductMoney = listItem.deductionIncome + listItem.punishIncome
      return {
        instituionName: listItem.name,
        soloNum: listItem.singlePhoto,
        multiplayerNum: listItem.manyPhoto,
        earningsCredit: '¥' + listItem.revenueIncome,
        impulseMoney: '¥' + listItem.impulseIncome,
        deductMoney: '¥' + deductMoney,
        realityMoney: '¥' + (listItem.revenueIncome + listItem.impulseIncome - deductMoney)
      }
    })
    return createData
  })
}

/**
 * @description 编辑修图机构
 * @param {*} params
 */
export function editRetouchOrg (params) {
  return axios({
    url: '/project_cloud/operator/editRetouchOrg',
    method: 'PUT',
    data: params
  })
}

/**
 * @description 启用摄影机构
 * @param {*} params
 */
export function enablePhotographerOrg (params) {
  return axios({
    url: '/project_cloud/operator/enablePhotographerOrg',
    method: 'PUT',
    data: params
  })
}

/**
 * @description 启用摄影机构
 * @param {*} params
 */
export function disablePhotographerOrg (params) {
  return axios({
    url: '/project_cloud/operator/disablePhotographerOrg',
    method: 'PUT',
    data: params
  })
}

/**
 * @description 获取摄影机构
 * @param {*} params
 */
export function getPhotographerOrgInfo (params) {
  return axios({
    url: '/project_cloud/operator/getPhotographerOrgInfo',
    method: 'GET',
    params
  }).then(msg => {
    return keyToHump(msg)
  })
}

/**
 * @description 添加摄影机构
 * @param {*} params
 */
export function addPhotographerOrg (params) {
  return axios({
    url: '/project_cloud/operator/addPhotographerOrg',
    method: 'POST',
    data: params
  })
}

/**
 * @description 编辑摄影机构
 * @param {*} params
 */
export function editPhotographerOrg (params) {
  return axios({
    url: '/project_cloud/operator/editPhotographerOrg',
    method: 'PUT',
    data: params
  })
}
