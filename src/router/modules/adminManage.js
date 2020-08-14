import Layout from '@/layout'

const adminManage = {
  path: '/admin-manage',
  component: Layout,
  name: 'AdminManage',
  redirect: '/admin-manage/work-board',
  meta: { title: '云端工作管理', icon: 'iconfont iconpiechart' },
  children: [
    {
      path: 'work-board',
      name: 'WorkBoard',
      component: () => import('@/views/admin-manage/work-board.vue'),
      meta: { title: '云端工作看板', icon: '' }
    }, {
      path: 'performance-inquire',
      name: 'PerformanceInquire',
      component: () => import('@/views/admin-manage/performance-inquire.vue'),
      meta: { title: '云端绩效查询', icon: '' }
    }, {
      path: 'amend-order',
      name: 'AmendOrder',
      component: () => import('@/views/admin-manage/amend-order.vue'),
      meta: { title: '修改照片产品', icon: '' }
    }, {
      path: 'performance-management',
      name: 'PerformanceManagement',
      component: () => import('@/views/admin-manage/performance-management.vue'),
      meta: { title: '云端绩效管理', icon: '' }
    }, {
      path: 'retouch-designate',
      name: 'RetouchDesignate',
      component: () => import('@/views/admin-manage/retouch-designate.vue'),
      meta: { title: '修图指派', icon: '' }
    }, {
      path: 'appeal-handle',
      name: 'AppealHandle',
      component: () => import('@/views/appeal/appeal-handle.vue'),
      meta: { title: '申诉处理', icon: '' }
    }
  ]
}

export default adminManage
