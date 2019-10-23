import router from './router'
import store from './store'
import NProgress from 'nprogress' // 加载进度条
import '@/styles/nprogress.less' // 进度条颜色
import { getXStreamId, getStreamIdExpireTime } from '@/utils/sessionTool' // get token from cookie
import * as User from '@/api/user.js'
import getPageTitle from '@/utils/get-page-title' // 获取页面title

NProgress.configure({ showSpinner: false }) // 关闭加载微调器

const whiteList = ['/', '/login', '/auth-redirect'] // 白名单

// 调试
// let nickname

router.beforeEach(async (to, from, next) => {
  NProgress.start() // 读取进度条
  document.title = getPageTitle(to.meta.title)
  const hasXStreamId = getXStreamId() // 获取token

  console.log(hasXStreamId, 'hasXStreamId')

  // 调试
  // if (nickname) {
  //   next()
  // } else {
  //   console.log(1)
  //   const accessRoutes = await store.dispatch('permission/generateRoutes', '')
  //   router.addRoutes(accessRoutes)
  //   nickname = 1
  //   next({ ...to, replace: true })
  // }

  // 没有过期时的操作
  async function noExpire () {
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else {
      const nickname = store.getters.nickname
      if (nickname) {
        next()
      } else {
        await store.dispatch('user/getUserInfo')
        next({ ...to, replace: true })
      }
    }
  }

  function goLogin () {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }

  if (hasXStreamId) {
    const expireTime = getStreamIdExpireTime() * 1000
    const nowTime = new Date().getTime()
    const discrepancyTime = expireTime - nowTime
    console.log(expireTime, 'expireTime')
    console.log(nowTime, 'nowTime')
    console.log(discrepancyTime, 'discrepancyTime')
    if (discrepancyTime > 0) {
      if (discrepancyTime < 60 * 60 * 1000 * 1000) { await User.userExpire() }
      console.log('noExpire')
      noExpire()
    } else if (discrepancyTime < 0) {
      User.logout()
      goLogin()
    }
  } else {
    // 没有xStreamId
    goLogin()
  }
})

router.afterEach(() => {
  NProgress.done() // 读取完成
})
