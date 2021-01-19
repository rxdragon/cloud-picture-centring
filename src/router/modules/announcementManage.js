import Layout from '@/layout'

const announcementManage = {
  path: '/announcement-manage',
  component: Layout,
  name: 'AnnouncementManage',
  alwaysShow: false,
  meta: { title: '公告管理', icon: 'iconfont iconcurrent' },
  children: [
    {
      path: 'announcement-manage-index',
      name: 'AnnouncementManageIndex',
      component: () => import('@/views/announcement-manage/announcement-manage-index.vue'),
      meta: { title: '公告管理', icon: '' }
    }
  ]
}

export default announcementManage
