import Layout from '@/layout'

const announcementCenter = {
  path: '/announcement-center',
  component: Layout,
  name: 'AnnouncementCenter',
  alwaysShow: false,
  redirect: '/announcement-center-index',
  meta: { title: '公告中心', icon: 'iconfont iconcurrent' },
  children: [
    {
      path: 'announcement-center-index',
      name: 'AnnouncementCenterIndex',
      component: () => import('@/views/announcement-center/announcement-center-index.vue'),
      meta: { title: '公告中心', icon: '' }
    }
  ]
}

export default announcementCenter
