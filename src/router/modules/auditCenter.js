/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/layout'

const auditCenter = {
  path: '/audit-center',
  component: Layout,
  redirect: '/audit-center/index',
  alwaysShow: true,
  meta: { title: '审核中心', icon: 'iconfont iconFiled' },
  children: [
    {
      path: 'index',
      name: 'AuditCenter',
      component: () => import('@/views/audit-center/index.vue'),
      meta: { title: '修图审核', icon: '' }
    },
    {
      path: 'audit-history',
      name: 'AuditHistory',
      component: () => import('@/views/audit-center/audit-history.vue'),
      meta: { title: '审核历史记录', icon: '', noCache: true }
    }
  ]
}
export default auditCenter
