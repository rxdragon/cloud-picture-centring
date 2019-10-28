import axios from '@/plugins/axios.js'
import jurisdictionList from '../assets/mock/per'

/**
 * @description 查询伙伴
 */
export function getStaff (params) {
  return axios({
    url: '/project_cloud/staff/searchStaffInfo',
    method: 'GET',
    params
  }).then(msg => {
    return msg
  })
}

/**
 * @description 获取伙伴信息
 */
export function getStaffInfo (params) {
  return axios({
    url: '/project_cloud/staff/getStaffInfo',
    method: 'GET',
    params
  }).then(msg => {
    return msg
  })
}

/**
 * @description 获取伙伴面板数据
 */
export function getStaffList () {
  const params = { needGroup: true }
  return axios({
    url: '/project_cloud/common/getStaffList',
    method: 'GET',
    params
  }).then(msg => {
    const createData = [{
      id: -1,
      gid: -1,
      pid: 0,
      label: '未分组',
      children: []
    }]
    msg.forEach(staff => {
      const staffInfo = {
        children: [],
        id: staff.id,
        label: staff.nickname || staff.name || '暂无姓名',
        pid: staff.department_id ? staff.department_id * -2 : -1,
        sid: staff.id
      }
      if (staff.department_id) {
        const groudInfo = staff.department
        const findGroud = createData.find(item => item.gid === groudInfo.id)
        if (findGroud) {
          findGroud.children = [...findGroud.children, staffInfo]
        } else {
          createData.push({
            id: groudInfo.id * -2,
            gid: groudInfo.id,
            pid: 0,
            label: groudInfo.name,
            children: [staffInfo]
          })
        }
      } else {
        createData[0].children = staffInfo
      }
    })
    if (!createData[0].children.length) { createData.shift(1) }
    return createData
  })
}

/**
 * @description 获取伙伴选择框数据
 */
export function getStaffSelectList () {
  const params = { needGroup: true }
  return axios({
    url: '/project_cloud/common/getStaffList',
    method: 'get',
    params
  }).then(msg => {
    const createData = [{
      label: '未分组',
      value: 0,
      children: []
    }]
    msg.forEach(staff => {
      const staffInfo = {
        value: staff.id,
        label: staff.nickname || staff.name || '暂无姓名'
      }
      if (staff.department_id) {
        const groudInfo = staff.department
        const findGroud = createData.find(item => item.gid === groudInfo.id)
        if (findGroud) {
          findGroud.children = [...findGroud.children, staffInfo]
        } else {
          createData.push({
            value: groudInfo.id,
            label: groudInfo.name,
            children: [staffInfo]
          })
        }
      } else {
        createData[0].children = staffInfo
      }
    })
    if (!createData[0].children.length) { createData.shift(1) }
    return createData
  })
}

/**
 * @description 获取伙伴角色组
 */
export function getAllRole () {
  return axios({
    url: '/project_cloud/common/getAllRole',
    method: 'get'
  }).then(msg => {
    const createData = []
    msg.forEach(roleItem => {
      createData.push({
        label: roleItem.name,
        value: roleItem.id
      })
    })
    return createData
  })
}

/**
 * @description 获取审核组
 */
export function getReviewer () {
  return axios({
    url: '/project_cloud/common/getReviewer',
    method: 'get'
  }).then(msg => {
    const createData = []
    msg.forEach(reviewerItem => {
      createData.push({
        label: reviewerItem.nickname || reviewerItem.name || '暂无姓名',
        value: reviewerItem.id
      })
    })
    return createData
  })
}

/**
 * @description 获取所有修图组
 */

export function getRetoucherGroup () {
  return axios({
    url: '/project_cloud/common/getRetoucherGroup',
    method: 'get'
  }).then(msg => {
    const createData = []
    msg.forEach(groupItem => {
      createData.push({
        label: groupItem.name,
        value: groupItem.id
      })
    })
    return createData
  })
}

/**
 * @description 获取自己组员
 */
export function getSelfStaffs () {
  return axios({
    url: '/project_cloud/common/getSelfStaffs',
    method: 'get'
  }).then(msg => {
    // 调试
    const createData = []
    console.log(msg)
    msg.forEach(selfStaffItem => {
      createData.push({
        label: selfStaffItem.nickname || selfStaffItem.name || '-',
        value: selfStaffItem.id
      })
    })
    return createData
  })
}

export function getJurisdictionList () {
  return jurisdictionList
}
