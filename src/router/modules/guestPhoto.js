import Layout from '@/layout'

const guestPhoto = {
  path: '/guest-photo',
  component: Layout,
  name: 'GuestPhoto',
  redirect: '/guest-photo/index',
  meta: { title: '客片池', icon: 'el-icon-picture-outline-round' },
  children: [
    {
      path: 'index',
      name: 'GuestPhoto',
      component: () => import('@/views/guest-photo/index.vue'),
      meta: { title: '客片池', icon: '' }
    }, {
      path: 'excellent-photo',
      name: 'ExcellentPhoto',
      component: () => import('@/views/guest-photo/evaluate-photo.vue'),
      meta: { title: '优秀客片', icon: '' }
    }, {
      path: 'issue-photo',
      name: 'IssuePhoto',
      component: () => import('@/views/guest-photo/evaluate-photo.vue'),
      meta: { title: '问题客片', icon: '' }
    }, {
      path: '/guest-info',
      name: 'GuestInfo',
      hidden: true,
      component: () => import('@/views/guest-photo/guest-info.vue'),
      meta: { title: '客片详情', icon: '' }
    }, {
      path: '/guest-photo-details',
      name: 'GuestPhotoDetails',
      hidden: true,
      component: () => import('@/views/guest-photo/guest-photo-details.vue'),
      meta: { title: '客片详情', icon: '' }
    }
  ]
}

export default guestPhoto
