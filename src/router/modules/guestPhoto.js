import Layout from '@/layout'

const guestPhoto = {
  path: '/guest-photo',
  component: Layout,
  name: 'GuestPhoto',
  redirect: '/guest-photo/guest-photo-center',
  meta: { title: '客片池', icon: 'el-icon-picture-outline-round' },
  children: [
    {
      path: 'guest-photo-center',
      name: 'GuestPhotoCenter',
      component: () => import('@/views/guest-photo/guest-photo-center.vue'),
      meta: { title: '客片池', icon: '' }
    }, {
      path: 'good-guest',
      name: 'GoodGuest',
      component: () => import('@/views/guest-photo/good-guest.vue'),
      meta: { title: '优秀客片', icon: '' }
    }, {
      path: 'bad-guest',
      name: 'BadGuest',
      component: () => import('@/views/guest-photo/bad-guest.vue'),
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
