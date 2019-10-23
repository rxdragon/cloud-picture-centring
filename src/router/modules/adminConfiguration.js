import Layout from '@/layout'

const adminConfiguration = {
  path: '/admin-configuration',
  component: Layout,
  redirect: '/admin-configuration/experience-config',
  meta: { title: '云端运营配置', icon: 'iconfont iconclassification' },
  children: [
    {
      path: 'experience-config',
      name: 'ExperienceConfig',
      component: () => import('@/views/admin-configuration/experience-config.vue'),
      meta: { title: '修图师翻倍经验配置', icon: '' }
    }, {
      path: 'amount-award',
      name: 'AmountAward',
      component: () => import('@/views/admin-configuration/amount-award.vue'),
      meta: { title: '修图师冲量奖励配置', icon: '' }
    }, {
      path: 'gold-config',
      name: 'GoldConfig',
      component: () => import('@/views/admin-configuration/gold-config.vue'),
      meta: { title: '修图师金币奖励配置', icon: '' }
    }, {
      path: 'sand-clock-config',
      name: 'SandClockConfig',
      component: () => import('@/views/admin-configuration/sand-clock-config.vue'),
      meta: { title: '沙漏计时配置', icon: '' }
    }, {
      path: 'green-aisle',
      name: 'GreenAisle',
      component: () => import('@/views/admin-configuration/green-aisle.vue'),
      meta: { title: '绿色免审通道', icon: '' }
    }, {
      path: 'product-control',
      name: 'ProductControl',
      component: () => import('@/views/admin-configuration/product-control.vue'),
      meta: { title: '产品管理', icon: '' }
    }
  ]
}

export default adminConfiguration
