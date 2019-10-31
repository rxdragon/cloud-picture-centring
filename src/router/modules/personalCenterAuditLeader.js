import Layout from '@/layout'

const personalCenterAuditLeader = {
  path: '/personal-center-audit-leader',
  component: Layout,
  name: 'PersonalCenterAuditLeader',
  redirect: '/personal-center-audit-leader/audit-history',
  meta: { title: '个人中心（审核组长）', icon: 'iconfont iconFullstaffing' },
  children: [
    {
      path: 'audit-report',
      name: 'AuditReport',
      component: () => import('@/views/personal-center-audit-leader/audit-report.vue'),
      meta: { title: '组员审核报告', icon: '' }
    }, {
      path: 'audit-survey',
      name: 'AuditSurvey',
      component: () => import('@/views/personal-center-audit/index.vue'),
      meta: { title: '个人审核概况', icon: '' }
    }
  ]
}
export default personalCenterAuditLeader
