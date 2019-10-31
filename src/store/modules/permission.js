import { asyncRoutes, constantRoutes } from '@/router'
import { toCapitalHump } from '@/utils/index.js'
import * as SessionTool from '@/utils/sessionTool.js'

/**
 * Use meta.role to determine if the current user has permission
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
      let accessedRoutes = SessionTool.getUserRoutes() || []
      if (!accessedRoutes.length) {
        const newRoles = [...roles.base_auth, ...roles.login_auth]
        let newRolesArr = []
        newRoles.forEach(roleItem => {
          if (roleItem.name) {
            const nameArr = roleItem.name.split('.')
            const moduleName = toCapitalHump(nameArr[0])
            const menuName = toCapitalHump(nameArr[1])
            newRolesArr = [...newRolesArr, moduleName, menuName]
          }
        })
        newRolesArr = [...new Set(newRolesArr)]
        accessedRoutes = filterAsyncRoutes(asyncRoutes, newRolesArr)
        SessionTool.setUserRoutes(accessedRoutes)
      }
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
