import Layout from '@/layout'

const adminManage = {
  path: '/admin-manage',
  component: Layout,
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
    }
  ]
}

export default adminManage
