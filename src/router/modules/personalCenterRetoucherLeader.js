/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/layout'

const personalCenterRetoucherLeader = {
  path: '/personal-center-retoucher-leader',
  component: Layout,
  name: 'PersonalCenterRetoucherLeader',
  redirect: '/personal-center-retoucher-leader/work-management',
  meta: { title: '个人中心（组长）', icon: 'iconfont iconFullstaffing' },
  children: [
    {
      path: 'retouch-report',
      name: 'RetouchReport',
      component: () => import('@/views/personal-center-retoucher-leader/retouch-report.vue'),
      meta: { title: '组员修图报告', icon: '' }
    }, {
      path: 'leader-audit-survey',
      name: 'LeaderAuditSurvey',
      component: () => import('@/views/personal-center-audit/index.vue'),
      meta: { title: '个人审核概况', icon: '' }
    }
  ]
}
export default personalCenterRetoucherLeader
