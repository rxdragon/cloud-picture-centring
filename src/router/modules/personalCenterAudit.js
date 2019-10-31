/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/layout'

const personalCenterAudit = {
  path: '/personal-center-audit',
  component: Layout,
  name: 'PersonalCenterAudit',
  redirect: '/personal-center-audit/index',
  alwaysShow: true,
  meta: { title: '个人中心（审核专员）', icon: 'iconfont iconFullstaffing' },
  children: [
    {
      path: 'index',
      name: 'AuditHistory',
      component: () => import('@/views/personal-center-audit/index.vue'),
      meta: { title: '个人审核概况', icon: '' }
    }
  ]
}
export default personalCenterAudit
