import { asyncRoutes, constantRoutes } from '@/router'
import { toCapitalHump } from '@/utils/index.js'
import store from '@/store'

/**
 * @param roles // 权限
 * @param route // 路由
 */
function hasPermission (roles, route) {
  return roles.includes(route.name)
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes (routes, roles) {
  const res = []
  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  // 判断动态路由
  generateRoutes ({ commit }, roles) {
    return new Promise(resolve => {
      let accessedRoutes = []
      const newRoles = roles
      let newRolesArr = []
      newRoles.forEach(roleItem => {
        if (roleItem.name) {
          const nameArr = roleItem.name.split('.')
          if (nameArr.length !== 3) return
          const moduleName = toCapitalHump(nameArr[0])
          const menuName = toCapitalHump(nameArr[1])
          newRolesArr = [...newRolesArr, moduleName, menuName]
        }
      })
      // 如果有修图权限 启动轮询
      if (newRolesArr.includes('WaitRetoucher')) {
        store.dispatch('notification/hasReturnNotification')
      }
      newRolesArr = [...new Set(newRolesArr)]
      accessedRoutes = filterAsyncRoutes(asyncRoutes, newRolesArr)
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
