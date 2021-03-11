import Layout from '@/layout'

const assessmentCenter = {
  path: '/assessment-center',
  component: Layout,
  name: 'AssessmentCenter',
  redirect: '/assessment-center/cloud-assessment',
  meta: { title: '云学院评价中心', icon: 'el-icon-edit' },
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
    }, {
      path: 'modify-history',
      name: 'ModifyHistory',
      component: () => import('@/views/assessment-center/modify-history.vue'),
      meta: { title: '评分修改记录', icon: '' }
    }, {
      path: 'grade-configuration',
      name: 'GradeConfiguration',
      component: () => import('@/views/assessment-center/old/grade-configuration.vue'),
      meta: { title: '云学院评分配置', icon: '' }
    }, {
      path: 'grade-configuration1',
      name: 'GradeConfiguration',
      component: () => import('@/views/assessment-center/grade-configuration.vue'),
      meta: { title: '云学院评分配置2', icon: '' }
    }
  ]
}

export default assessmentCenter
