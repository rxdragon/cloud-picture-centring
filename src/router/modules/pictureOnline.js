/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/layout'

const pictureOnline = {
  path: '/watcher-online',
  component: Layout,
  name: 'WatcherOnline',
  alwaysShow: true,
  meta: { title: '看片师中心', icon: 'iconfont iconcurrent' },
  children: [
    {
      path: '/watcher-online/watch-photo-center/picture-online',
      component: () => import('@/views/watcher-online-center/picture-online'),
      name: 'PictureOnline',
      meta: { title: '在线看片', icon: 'iconfont icongailan', microApp: true }
    },
    {
      path: '/watcher-online/watch-photo-center/picture-online-history',
      component: () => import('@/views/watcher-online-center/picture-online-history'),
      name: 'PictureOnlineHistory',
      meta: { title: '在线看片历史记录', icon: 'iconfont icongailan', microApp: true }
    },
    {
      path: '/watcher-online/watch-photo-center/order-detail',
      component: () => import('@/views/watcher-online-center/online-order-detail'),
      name: 'OrderDetail',
      meta: { title: '在线看片历史记录', icon: 'iconfont icongailan', microApp: true },
      hidden: true
    },
    {
      path: '/watcher-online/online-watch-performance/performance-search',
      component: () => import('@/views/watcher-online-center/performance-search'),
      name: 'OrderDetail',
      meta: { title: '看片绩效查询', icon: 'iconfont icongailan', microApp: true }
    },
  ]
}
export default pictureOnline
