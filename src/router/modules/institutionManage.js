import Layout from '@/layout'

const institutionManage = {
  path: '/institution-manage',
  component: Layout,
  name: 'InstitutionManage',
  redirect: '/institution-manage/retouch-manage',
  meta: { title: '机构管理', icon: 'iconfont iconSubordinate' },
  children: [
    {
      path: 'retouch-manage',
      name: 'RetouchManage',
      component: () => import('@/views/institution-manage/retouch-manage.vue'),
      meta: { title: '修图机构管理', icon: '' }
    }, {
      path: 'performance',
      name: 'Performance',
      component: () => import('@/views/institution-manage/performance.vue'),
      meta: { title: '修图机构绩效', icon: '' }
    }, {
      path: 'photography-manage',
      name: 'PhotographyManage',
      component: () => import('@/views/institution-manage/photography-manage.vue'),
      meta: { title: '摄影机构管理', icon: '' }
    }
  ]
}

export default institutionManage
