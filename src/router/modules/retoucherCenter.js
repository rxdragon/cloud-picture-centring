/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/layout'

const retoucherCenter = {
  path: '/retoucher-center',
  component: Layout,
  name: 'RetoucherCenter',
  redirect: '/retoucher-center/wait-retoucher',
  alwaysShow: true,
  meta: { title: '修图师中心', icon: 'iconfont iconcurrent' },
  children: [
    {
      path: 'wait-retoucher',
      name: 'WaitRetoucher',
      component: () => import('@/views/retoucher-center/wait-retoucher.vue'),
      meta: { title: '待修订单', icon: '' }
    }, {
      path: 'retouch-history',
      name: 'RetouchHistory',
      component: () => import('@/views/retoucher-center/retouch-history.vue'),
      meta: { title: '修图历史记录', icon: '' }
    }
  ]
}
export default retoucherCenter
