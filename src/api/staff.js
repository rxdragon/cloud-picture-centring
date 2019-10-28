import axios from '@/plugins/axios.js'

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
        const findGroud = createData.find(item => {
          return item.gid === staff.department_id
        })
        if (findGroud) {
          findGroud.children = [...findGroud.children, staffInfo]
        } else {
          createData.push({
            value: staff.department_id,
            label: groudInfo && groudInfo.name || '-',
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
  return axios({
    url: '/project_cloud/staff/getPermissionList',
    method: 'get'
  }).then(msg => {
    const permissions = []
    msg.forEach(permissionItem => {
      const nameArr = permissionItem.name.split('.')
      const titleNameArr = permissionItem.title.split('-')
      const moduleName = nameArr[0]
      const moduleTitleName = titleNameArr[0]
      const menuName = nameArr[1]
      const menuTitleName = titleNameArr[1]
      const permissionName = nameArr[2]
      const permissionTitleName = titleNameArr[2]
      const findModuleItem = permissions.find(moduleItem => moduleItem.idName === moduleName)
      if (findModuleItem) {
        const findMenuItem = findModuleItem.menu.find(menuItem => menuItem.idName === menuName)
        if (findMenuItem) {
          const newPermission = {
            desc: permissionTitleName,
            idName: permissionName,
            id: permissionItem.permission_id,
            menu_id: findMenuItem.id,
            module_id: findModuleItem.id,
            name: permissionName,
            title: permissionTitleName
          }
          findMenuItem.permission.push(newPermission)
        } else {
          const newPermission = {
            desc: permissionTitleName,
            idName: permissionName,
            id: permissionItem.permission_id,
            menu_id: 0,
            module_id: findModuleItem.id,
            name: permissionName,
            title: permissionTitleName
          }
          const menuItem = {
            checkPermission: [],
            idName: menuName,
            id: findModuleItem.menu.length,
            isIndeterminate: false,
            isShow: false,
            module_id: 0,
            name: menuTitleName,
            permission: [newPermission],
            setAll: false
          }
          findModuleItem.menu.push(menuItem)
        }
      } else {
        const newPermission = {
          desc: permissionTitleName,
          idName: permissionName,
          id: permissionItem.permission_id,
          menu_id: 0,
          module_id: 0,
          name: permissionName,
          title: permissionTitleName
        }
        const newMenu = {
          checkPermission: [],
          idName: menuName,
          id: 0,
          isIndeterminate: false,
          isShow: false,
          module_id: 0,
          name: menuTitleName,
          permission: [newPermission],
          setAll: false
        }
        const moduleItem = {
          checkMenu: [],
          idName: moduleName,
          id: permissions.length,
          isIndeterminate: false,
          menu: [newMenu],
          name: moduleTitleName,
          setAll: false
        }
        permissions.push(moduleItem)
      }
    })
    return permissions
  })
}
