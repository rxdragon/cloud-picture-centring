import Vue from 'vue'
import Router from 'vue-router'

import Layout from '@/layout' //

const originalPush = Router.prototype.push

Router.prototype.push = function push (location) {
  return originalPush.call(this, location).catch(err => err)
}

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
import retoucherCenter from './modules/retoucherCenter.js' // 修图师中心
import pictureOnline from './modules/pictureOnline.js' // 看片师中心
import announcementManage from './modules/announcementManage.js' // 公告管理
import announcementCenter from './modules/announcementCenter.js' // 公告中心


// 实验路由
export const experimentRoutes = [{
  path: '/experiment-view',
  component: Layout,
  redirect: '/experiment-view/index',
  children: [{
    path: '/index',
    name: 'ExperimentView',
    component: () => import('@/views/experiment-view/index.vue'),
    meta: { title: '扩展功能', icon: 'el-icon-setting' }
  }]
}]

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
  },
  {
    path: '/check-time',
    component: () => import('@/views/check-time/index.vue'),
    hidden: true
  },
  {
    path: '/login',
    component: () => import('@/views/login/login.vue'),
    hidden: true
  },
  {
    path: '/network-debug',
    component: () => import('@/views/network-debug/network-debug.vue'),
    hidden: true
  },
  {
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
  },
  {
    path: '/order-detail',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        name: 'orderDetail',
        component: () => import('@/views/order-detail/index.vue'),
        meta: { title: '修图详情', icon: 'el-icon-eleme' }
      }
    ]
  },
  {
    path: '/appeal-detail',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '',
        name: 'appealDetail',
        component: () => import('@/views/appeal/appeal-detail.vue'),
        meta: { title: '申诉详情', icon: '' }
      }
    ]
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '*',
    component: () => import('@/views/error-page/404'),
    hidden: true
  }
]

export const lastBaseRoutes = [
  {
    path: '/update-notes',
    component: Layout,
    meta: { title: '关于', icon: 'el-icon-s-order' },
    children: [
      {
        path: 'update-notes-list',
        name: 'updateNotesList',
        component: () => import('@/views/update-notes/update-notes-list.vue'),
        meta: { title: '关于', icon: '' }
      }
    ]
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
  personalCenterRetoucherLeader,
  pictureOnline,
  announcementManage,
  announcementCenter
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
