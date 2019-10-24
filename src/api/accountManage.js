import axios from '@/plugins/axios.js'

/**
 * @description 获取账号列表
 * @param {*} params
 */
export function getStaffListByPage (params) {
  return axios({
    url: '/project_cloud/staff/getStaffListByPage',
    method: 'GET',
    params
  }).then(msg => {
    msg.list.map(item => {
      item.status = item.account_available ? '可用' : '不可用'
    })
    return msg
  })
}

/**
 * @description 获取角色组列表
 * @param {*} params
 */
export function enableStaff (params) {
  return axios({
    url: '/project_cloud/staff/enableStaff',
    method: 'PUT',
    data: params
  }).then(msg => {
    return msg
  })
}

/**
 * @description 禁用伙伴
 * @param {*} params
 */
export function disableStaff (params) {
  return axios({
    url: '/project_cloud/staff/disableStaff',
    method: 'PUT',
    data: params
  }).then(msg => {
    return msg
  })
}

/**
 * @description 添加伙伴
 * @param {*} params
 */
export function addStaff (params) {
  return axios({
    url: '/project_cloud/staff/addStaff',
    method: 'POST',
    data: params
  }).then(msg => {
    return msg
  })
}

/**
 * @description 编辑伙伴
 * @param {*} params
 */
export function editStaff (params) {
  return axios({
    url: '/project_cloud/staff/editStaff',
    method: 'PUT',
    data: params
  }).then(msg => {
    return msg
  })
}

/**
 * @description 获取伙伴权限
 * @param {*} params
 */
export function getStaffPermission (params) {
  return axios({
    url: '/project_cloud/staff/getStaffPermission',
    method: 'GET',
    params
  }).then(msg => {
    return msg
  })
}

/**
 * @description 获取角色组列表
 */
export function getRoleList (params) {
  return axios({
    url: '/project_cloud/staff/getRoleList',
    method: 'GET',
    params
  }).then(msg => {
    return msg
  })
}

/**
 * @description 删除角色组接口
 * @param {*} params
 */
export function delRole (params) {
  return axios({
    url: '/project_cloud/staff/delRole',
    method: 'DELETE',
    params
  })
}

/**
 * @description 添加权限组
 * @param {*} params
 */
export function addRole (params) {
  return axios({
    url: '/project_cloud/staff/addRole',
    method: 'POST',
    data: params
  })
}

/**
 * @description 获取权限组信息
 * @param {*} params
 */
export function getRoleInfo (params) {
  return axios({
    url: '/project_cloud/staff/getRoleInfo',
    method: 'GET',
    params
  }).then(msg => {
    return msg
  })
}

/**
 * @description 编辑角色组
 * @param {*} params
 */
export function editRole (params) {
  return axios({
    url: '/project_cloud/staff/editRole',
    method: 'PUT',
    data: params
  })
}

/**
 * @description 获取按照产品划分的 修图师类别 列表
 * @param {*} params
 */
export function getRetoucherClassList (params) {
  return axios({
    url: '/project_cloud/staff/getRetoucherClassList',
    method: 'GET',
    params
  }).then(msg => {
    msg.list.forEach(listItem => {
      listItem.nickname = listItem.nickname || '-'
    })
    return msg
  })
}

/**
 * @description 添加按照产品划分的 修图师类别
 * @param {*} params
 */
export function addRetoucherClass (params) {
  return axios({
    url: '/project_cloud/staff/addRetoucherClass',
    method: 'POST',
    data: params
  })
}

/**
 * @description 删除按照产品划分的 修图师类别
 * @param {*} params
 */
export function delRetoucherClass (params) {
  return axios({
    url: '/project_cloud/staff/delRetoucherClass',
    method: 'DELETE',
    params
  })
}

/**
 * @description 编辑按照产品划分的 修图师类别
 * @param {*} params
 */
export function editRetoucherClass (params) {
  return axios({
    url: '/project_cloud/staff/editRetoucherClass',
    method: 'PUT',
    data: params
  })
}

/**
 * @description 获取按照产品划分的 修图师类别
 * @param {*} params
 */
export function getRetoucherClassInfo (params) {
  return axios({
    url: '/project_cloud/staff/getRetoucherClassInfo',
    method: 'GET',
    params
  })
}
