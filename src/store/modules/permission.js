import { asyncRoutes, constantRoutes, lastBaseRoutes } from '@/router'
import { toCapitalHump } from '@/utils/index.js'
import store from '@/store'
import chat from '@/api/websocket'

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
      if (tmp.children) { tmp.children = filterAsyncRoutes(tmp.children, roles) }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: [],
  personageRouters: [],
  roles: [],
  showPartnerPerformance: false, // 是否显示伙伴绩效
  showOverallPerformance: false, // 是否显示总体绩效
  showAuditPerformance: false, // 是否显示审核绩效
  showTimeStatistics: false, // 是否显示用时统计
  showCheckerEvaluate: false, // 是否显示看片评价
  showFlowInfo: false, // 是否显示浏览看板
  showRetouchStreamList: false, // 是否显示修图队列
  showReviewStreamList: false, // 是否显示审核队列
  showStreamList: false, // 是否显示浏览加急查询
  showUrgentStream: false, // 是否显示加急按钮
  isRetoucher: false, // 是否是修片师
  showWorkInfo: false // 是否可以查看工作看板详情按钮
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
    state.showPartnerPerformance = roles.includes('AdminManage.performanceInquire.retoucherQuota')
    state.showAuditPerformance = roles.includes('AdminManage.performanceInquire.reviewQuota')
    state.showCheckerEvaluate = roles.includes('AdminManage.performanceInquire.storeEvaluate')
    // TODO 判断是否显示显示总体绩效
    // state.showOverallPerformance = roles.includes('retoucherQuota')
    // 调试
    state.showOverallPerformance = true
    // TODO 判断是否显示用时统计
    // 调试
    state.showTimeStatistics = true
    state.showFlowInfo = roles.includes('AdminManage.workBoard.flowInfo')
    state.showRetouchStreamList = roles.includes('AdminManage.workBoard.retouchStreamList')
    state.showReviewStreamList = roles.includes('AdminManage.workBoard.reviewStreamList')
    state.showStreamList = roles.includes('AdminManage.workBoard.streamList')
    state.showUrgentStream = roles.includes('AdminManage.workBoard.urgentStream')
    state.isRetoucher = roles.includes('RetoucherCenter.waitRetoucher.deal')
    state.showWorkInfo = roles.includes('AdminManage.workBoard.showOrderInfo')
    chat.initializeSendMessage(state.isRetoucher)
  },
  SET_PERSONAGE_ROUTES: (state, routes) => {
    state.personageRouters = routes
  }
}

const actions = {
  // 判断动态路由
  generateRoutes ({ commit }, roles) {
    return new Promise(resolve => {
      let accessedRoutes = []
      const newRoles = roles
      let newRolesArr = []
      const newPermissionArr = []
      newRoles.forEach(roleItem => {
        if (roleItem.name) {
          const nameArr = roleItem.name.split('.')
          // 全部权限列表
          newPermissionArr.push(toCapitalHump(roleItem.name))
          if (nameArr.length !== 3) return
          const moduleName = toCapitalHump(nameArr[0])
          const menuName = toCapitalHump(nameArr[1])
          newRolesArr = [...newRolesArr, moduleName, menuName]
        }
      })
      commit('SET_ROLES', newPermissionArr)
      // 如果有修图权限 查询在线状态
      if (newRolesArr.includes('WaitRetoucher')) {
        window.addEventListener('click', () => {
          store.commit('user/SET_ACTIVE_TIME')
        })
      }
      newRolesArr = [...new Set(newRolesArr)]
      accessedRoutes = [...filterAsyncRoutes(asyncRoutes, newRolesArr), ...lastBaseRoutes]
      commit('SET_PERSONAGE_ROUTES', accessedRoutes)
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
