import Layout from '@/layout'

const assessmentCenter = {
  path: '/assessment-center',
  component: Layout,
  redirect: '/assessment-center/cloud-assessment',
  meta: { title: '评价中心', icon: 'el-icon-edit' },
  children: [
    {
      path: 'cloud-assessment',
      name: 'CloudAssessment',
      component: () => import('@/views/assessment-center/cloud-assessment.vue'),
      meta: { title: '云学院评价中心', icon: '' }
    }, {
      path: 'assessment-history',
      name: 'AssessmentHistory',
      component: () => import('@/views/assessment-center/assessment-history.vue'),
      meta: { title: '评价历史记录', icon: '' }
    }
  ]
}

export default assessmentCenter
