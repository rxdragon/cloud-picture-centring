import { asyncRoutes, constantRoutes, lastBaseRoutes } from '@/router'
import { toCapitalHump } from '@/utils/index.js'
import store from '@/store'
import Vue from 'vue'
import Ws from '@/api/websocket'

/**
 * @param roles // 权限
 * @param route // 路由
 */
function hasPermission (roles, route) {
  return roles.includes(route.name)
}

/**
 * 过滤含有权限路由
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
  addRoutes: [],
  personageRouters: [],
  roles: [],
  hasWorkbench: false, // 是否显示工作看板
  showPartnerPerformance: false, // 是否显示伙伴绩效
  showOverallPerformance: false, // 是否显示总体绩效
  showAuditPerformance: false, // 是否显示审核绩效
  showRetoucherGroupPerformance: false, // 是否显示修图组绩效
  showRetoucherChargeBackReport: false, // 云学院绩效查询-是否显示退单统计
  showCloudCollegeReport: false, // 云学院绩效查询-是否显示云学院报告
  showPicCollegeReport: false, // 修修兽评价绩效查询-是否显示修修手抽片报告
  showTimeStatistics: false, // 是否显示用时统计
  showCheckerEvaluate: false, // 是否显示看片评价
  showFlowInfo: false, // 是否显示浏览看板
  showRetouchStreamList: false, // 是否显示修图队列
  showReviewStreamList: false, // 是否显示审核队列
  showReturnStreamToQueue: false, // 显示流水退回
  showStreamList: false, // 是否显示浏览加急查询
  showUrgentStream: false, // 是否显示加急按钮
  isRetoucher: false, // 是否是修片师
  showWorkInfo: false, // 是否可以查看工作看板详情按钮
  showSpotRecheck: false, // 是否显示重新打分按钮
  showEmptyCheckPool: false, // 是否显示清空按钮
  canAutoRetouch: false, // 是否显示自动修图按钮
  autoBuffingA: false, // 是否显示磨皮A
  autoBuffingB: false, // 是否显示液化B
  useNewAutoApi: false, // 使用新的自动修图
  showAppealAccess: false, // 是否显示审核权限
  showFirstExamine: false, // 是否显示初审按钮
  showSecondExamine: false, // 是否显示复审按钮
  isOnlineWatcher: false, // 是否是在线看片师
  showAddStaff: false, // 账号配置是否显示添加按钮
  showDisableStaff: false, // 账号配置是否显示禁用按钮
  showEditStaff: false, // 账号配置是否显示编辑按钮
  showEnableStaff: false, // 账号配置是否显示启用按钮
  showInformation: false, // 显示公告按钮
  showAnnouncementDelete: false, // 显示公告删除按钮
  showRetouchingGoalsView: false, // 是否有修图组目标的页面
  showRetoucherGoal: false, // 修改全云端每日目标
  showRetoucherGroupGoal: false // 修改某一个组的每日目标
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
    state.showRetoucherGroupPerformance = roles.includes('AdminManage.performanceInquire.retoucherGroupPerformance')
    state.showRetoucherChargeBackReport = roles.includes('AdminManage.performanceInquire.retoucherChargeBackReport')
    state.showCloudCollegeReport = roles.includes('AdminManage.performanceInquire.cloudCollegeReport')
    state.showPicCollegeReport = roles.includes('AdminManage.performanceInquire.showPicCollegeReport')

    state.showCheckerEvaluate = roles.includes('AdminManage.performanceInquire.storeEvaluate')
    state.showOverallPerformance = roles.includes('AdminManage.performanceInquire.overallperformance')
    state.showTimeStatistics = roles.includes('AdminManage.performanceInquire.timestatistics')

    state.showFlowInfo = roles.includes('AdminManage.workBoard.flowInfo')
    state.showRetouchStreamList = roles.includes('AdminManage.workBoard.retouchStreamList')
    state.showReviewStreamList = roles.includes('AdminManage.workBoard.reviewStreamList')
    state.showStreamList = roles.includes('AdminManage.workBoard.streamList')
    state.showUrgentStream = roles.includes('AdminManage.workBoard.urgentStream')
    state.showWorkInfo = roles.includes('AdminManage.workBoard.showOrderInfo')
    state.showReturnStreamToQueue = roles.includes('AdminManage.workBoard.returnStreamToQueue')

    state.isRetoucher = roles.includes('RetoucherCenter.waitRetoucher.deal')
    state.showSpotRecheck = roles.includes('AssessmentCenter.cloudAssessment.spotRecheck')
    // 修修兽清空抽片权限
    state.showEmptyCheckPool = roles.includes('AssessmentCenter.gradeConfiguration.emptyCheckPool')
    // eslint-disable-next-line max-len
    state.showShowpicEmptyCheckPool = roles.includes('ShowpicAssessmentCenter.showpicGradeConfiguration.emptyCheckPool')
    // 自动修图
    state.canAutoRetouch = roles.includes('RetoucherCenter.waitRetoucher.autoRetouch')
    state.autoBuffingA = roles.includes('RetoucherCenter.waitRetoucher.autoBuffingA')
    state.autoBuffingB = roles.includes('RetoucherCenter.waitRetoucher.autoBuffingB')
    state.useNewAutoApi = state.autoBuffingA || state.autoBuffingB
    // 审核权限
    state.showAppealAccess = roles.includes('RetoucherCenter.appealHistory.add')
    state.showFirstExamine = roles.includes('AdminManage.appealHandle.firstExamine')
    state.showSecondExamine = roles.includes('AdminManage.appealHandle.secondExamine')

    state.isOnlineWatcher = roles.includes('WatcherOnline.watchPhotoCenter.pictureOnline.watchRecordList')

    state.showAddStaff = roles.includes('AccountManage.accountConfig.addStaff')
    state.showDisableStaff = roles.includes('AccountManage.accountConfig.disableStaff')
    state.showEditStaff = roles.includes('AccountManage.accountConfig.editStaff')
    state.showEnableStaff = roles.includes('AccountManage.accountConfig.enableStaff')

    // 工作看板权限
    const hasRetouchWorkbench = roles.includes('Workbench.retouchInfo.get')
    const hasOnlineWorkbench = roles.includes('Workbench.pictureOnlineInfo.get')
    const hasProductReview = roles.includes('Workbench.productCheck.get')
    state.hasWorkbench = hasRetouchWorkbench || hasOnlineWorkbench || hasProductReview
    // 通知
    state.showInformation = roles.includes('AnnouncementCenter.announcementCenterIndex.list')
    // 删除
    state.showAnnouncementDelete = roles.includes('AnnouncementManage.announcementManageIndex.delete')
    // 每日目标
    // 是否可以看到修图组目标菜单
    state.showRetouchingGoalsView = roles.includes('AdminManage.performanceInquire.retouchGroupGoalView')
    // 是否可以设置每日目标
    state.showUpdateRetoucherGoal = roles.includes('AdminManage.performanceInquire.setOverallGoal')
    // 是否可以修改组的基础值
    state.showUpdateRetoucherGroupGoal = roles.includes('AdminManage.performanceInquire.setRetouchGroupGoal')
    Vue.prototype.$ws = new Ws()
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
          nameArr.length = nameArr.length - 1
          // 全部权限列表
          newPermissionArr.push(toCapitalHump(roleItem.name))
          const componentNames = nameArr.map(item => toCapitalHump(item))
          newRolesArr = [...newRolesArr, ...componentNames]
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

      // 开发增加新增版本路由
      const developIds = [605673, 609061, 613495, 612593, 607924, 605268]
      if (developIds.includes(store.getters.staffId)) {
        lastBaseRoutes[0].children = [
          {
            path: 'update-notes-list',
            name: 'updateNotesList',
            component: () => import('@/views/update-notes/update-notes-list.vue'),
            meta: { title: '关于', icon: '' }
          },
          {
            path: 'edit-update-notes',
            name: 'editUpdateNotes',
            component: () => import('@/views/update-notes/edit-update-notes.vue'),
            meta: { title: '新增版本', icon: '' }
          }
        ]
      }

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
