import Layout from '@/layout'

const showpicAssessmentCenter = {
  path: '/showpic-assessment-center',
  component: Layout,
  name: 'ShowpicAssessmentCenter',
  redirect: '/showpic-assessment-center/showpic-assessment',
  meta: { title: '修修兽评价中心', icon: 'el-icon-edit' },
  children: [
    {
      path: 'showpic-assessment',
      name: 'ShowpicAssessment',
      component: () => import('@/views/showpic-assessment-center/showpic-assessment.vue'),
      meta: { title: '修修兽评价中心', icon: '' }
    }, {
      path: 'showpic-assessment-history',
      name: 'ShowpicAssessmentHistory',
      component: () => import('@/views/showpic-assessment-center/showpic-assessment-history.vue'),
      meta: { title: '评价历史记录', icon: '' }
    }, {
      path: 'showpic-modify-history',
      name: 'ShowpicModifyHistory',
      component: () => import('@/views/showpic-assessment-center/showpic-modify-history.vue'),
      meta: { title: '评分修改记录', icon: '' }
    }, {
      path: 'showpic-grade-configuration',
      name: 'ShowpicGradeConfiguration',
      component: () => import('@/views/showpic-assessment-center/showpic-grade-configuration.vue'),
      meta: { title: '评分配置', icon: '' }
    }
  ]
}

export default showpicAssessmentCenter
