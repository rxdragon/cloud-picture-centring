/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/layout'

const personalCenterRetoucher = {
  path: '/personal-center-retoucher',
  component: Layout,
  name: 'PersonalCenterRetoucher',
  redirect: '/personal-center-retoucher/personal-details',
  meta: { title: '个人中心（组员）', icon: 'iconfont iconFullstaffing' },
  alwaysShow: true,
  children: [
    {
      path: 'personal-details',
      name: 'PersonalDetails',
      component: () => import('@/views/personal-center-retoucher/personal-details.vue'),
      meta: { title: '个人修图概况', icon: '', noCache: true }
    }
  ]
}
export default personalCenterRetoucher
