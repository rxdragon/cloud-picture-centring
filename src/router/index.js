import Vue from 'vue'
import Router from 'vue-router'

import Layout from '@/layout' //

Vue.use(Router)

import accountManage from './modules/accountManage.js' // 账号管理
import adminConfiguration from './modules/adminConfiguration.js' // 运营配置
import adminManage from './modules/adminManage.js' // 运营工作管理
import assessmentCenter from './modules/assessmentCenter.js' // 评价中心
import auditCenter from './modules/auditCenter.js' // 审核中心
import guestPhoto from './modules/guestPhoto.js' // 客片池
import institutionManage from './modules/institutionManage.js' // 机构管理
import personalCenterAudit from './modules/personalCenterAudit.js' // 个人中心（审核专员）
import personalCenterAuditLeader from './modules/personalCenterAuditLeader.js' // 个人中心（审核组长）
import personalCenterRetoucher from './modules/personalCenterRetoucher.js' // 个人中心（组员）
import personalCenterRetoucherLeader from './modules/personalCenterRetoucherLeader.js' // 个人中心（组长）
import retoucherCenter from './modules/retoucherCenter.js' // 修片师中心

// 基础权限路由
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path*',
        component: () => import('@/views/redirect/index')
      }
    ]
  }, {
    path: '/login',
    component: () => import('@/views/login/login.vue'),
    hidden: true
  }, {
    path: '/',
    component: Layout,
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/home/home.vue'),
        meta: { title: '概况', icon: 'iconfont iconlogo', affix: true }
      }
    ]
  }, {
    path: '/order-detail',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        name: 'orderDetail',
        component: () => import('@/views/order-detail/index.vue'),
        meta: { title: '订单详情', icon: 'el-icon-eleme' }
      }
    ]
  }, {
    path: '*',
    component: () => import('@/views/error-page/404'),
    hidden: true
  }
]

export const asyncRoutes = [
  retoucherCenter,
  accountManage,
  adminManage,
  adminConfiguration,
  assessmentCenter,
  auditCenter,
  guestPhoto,
  institutionManage,
  personalCenterAudit,
  personalCenterAuditLeader,
  personalCenterRetoucher,
  personalCenterRetoucherLeader
]

const createRouter = () => new Router({
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// url不变强制刷行
export function resetRouter () {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher
}

export default router
