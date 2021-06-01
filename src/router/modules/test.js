/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/layout'

// const Test = {
//   path: '/app-vue-vite',
//   component: Layout,
//   name: 'CloudSpotCheckCenter',
//   alwaysShow: true,
//   meta: { title: '测试模块', icon: 'iconfont iconcurrent' },
//   children: [
//     {
//       path: '/app-vue-vite/home',
//       component: () => import('@/views/watcher-online-center/picture-online'),
//       name: 'Text1',
//       meta: { title: '测试1', icon: 'iconfont icongailan', microApp: true }
//     },
//     {
//       path: '/app-vue-vite/about',
//       component: () => import('@/views/watcher-online-center/picture-online'),
//       name: 'texthome',
//       meta: { title: '首页', icon: 'iconfont icongailan', microApp: true }
//     },
//   ]
// }

const Test = {
  path: '/cloud-spot-check-center',
  component: Layout,
  name: 'CloudSpotCheckCenter',
  alwaysShow: true,
  meta: { title: '测试模块', icon: 'iconfont iconcurrent' },
  children: [
    {
      path: '/cloud-spot-check-center/text-center/text1',
      component: () => import('@/views/watcher-online-center/picture-online'),
      name: 'Text1',
      meta: { title: '测试1', icon: 'iconfont icongailan', microApp: true }
    },
    {
      path: '/cloud-spot-check-center/home',
      component: () => import('@/views/watcher-online-center/picture-online'),
      name: 'texthome',
      meta: { title: '首页', icon: 'iconfont icongailan', microApp: true }
    },
    {
      path: '/cloud-spot-check-center/text-center/text2',
      component: () => import('@/views/watcher-online-center/picture-online'),
      name: 'text2',
      meta: { title: '测试2', icon: 'iconfont icongailan', microApp: true }
    }
  ]
}
export default Test
