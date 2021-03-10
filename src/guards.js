import router from './router'
import store from './store'
import NProgress from 'nprogress' // 加载进度条
import '@/styles/nprogress.less' // 进度条颜色
import { getXStreamId, getStreamIdExpireTime } from '@/utils/sessionTool' // get token from cookie
import * as User from '@/api/user.js'
import getPageTitle from '@/utils/get-page-title' // 获取页面title

NProgress.configure({ showSpinner: false }) // 关闭加载微调器

const whiteList = ['/', '/login', '/auth-redirect', '/401', '/404', '/network-debug', '/check-time'] // 白名单

router.beforeEach(async (to, from, next) => {
  NProgress.start() // 读取进度条
  document.title = getPageTitle(to.meta.title)
  const hasXStreamId = getXStreamId() // 获取token
  console.warn(to.path)
  // 没有过期时的操作
  async function noExpire () {
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else {
      if (whiteList.includes(to.path)) {
        next()
      }
      const name = store.getters.name
      if (name) {
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
    // 校验本地时间和网络时间
    checkLocaklTime(next)

    // 下次的过期时间
    const expireTime = getStreamIdExpireTime() * 1000
    const nowTime = new Date().getTime()
    const discrepancyTime = expireTime - nowTime

    if (discrepancyTime > 0) {
      // 过期时间小于1小时续上
      if (discrepancyTime < 60 * 60 * 1000) {
        await User.userExpire()
      }
      
      noExpire()
    } else if (discrepancyTime < 0) {
      User.logout()
      goLogin()
    }
  } else {
    goLogin() // 没有xStreamId
  }
})

router.afterEach(() => {
  NProgress.done() // 读取完成
})

/**
 * @description 检查本地时间和网络时间
 * @param {*} params 
 */
async function checkLocaklTime (next) {
  const isDev = !process.env.VUE_APP_LOGIN_API.includes('online')
  if (isDev) return
  const onlineDate = await User.getOnlineTime()
  const localDate = new Date().getTime()
  let diff = (onlineDate - localDate) / 1000
  diff = Math.abs(diff)
  // 如果大于30s贼同步时间
  if (diff > 30) {
    next(`/check-time`)
    NProgress.done()
  }
}
