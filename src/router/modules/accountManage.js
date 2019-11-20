import Layout from '@/layout'

const accountManage = {
  path: '/account-manage',
  component: Layout,
  name: 'AccountManage',
  redirect: '/account-manage/account-config',
  meta: { title: '账号管理', icon: 'iconfont iconstaff' },
  children: [
    {
      path: 'account-config',
      name: 'AccountConfig',
      component: () => import('@/views/account-manage/account-config.vue'),
      meta: { title: '账号配置', icon: '' }
    }, {
      path: 'retouch-category',
      name: 'RetouchCategory',
      component: () => import('@/views/account-manage/retouch-category.vue'),
      meta: { title: '修图类别配置', icon: '' }
    }, {
      path: 'role-config',
      name: 'RoleConfig',
      component: () => import('@/views/account-manage/role-config.vue'),
      meta: { title: '角色组配置', icon: '' }
    }
  ]
}

export default accountManage
