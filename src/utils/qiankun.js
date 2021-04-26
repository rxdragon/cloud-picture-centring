/* eslint-disable no-console */
import { prefetchApps, registerMicroApps, loadMicroApp, start, addGlobalUncaughtErrorHandler } from 'qiankun'
import * as SessionTool from '@/utils/sessionTool'
import { readConfig } from "../utils/electronConfig"
import DownIpc from '@electronMain/ipc/DownIpc'
import store from '@/store' // vuex

// 解决 popper 查找父级代码错误问题
const rawGetComputedStyle = window.getComputedStyle
window.getComputedStyle = function (el, pseudoElt) {
  if (el.nodeType === 11) { return {'overflow': 'auto'} }
  return rawGetComputedStyle(el, pseudoElt)
}
// 解决定位问题
// 既然 popper.js 拿了 document 作为 offsetParent 对象，那将错就错，把 document 对象模拟成 document.documentElement 对象，使它可以正常运作
Object.defineProperty(document, 'scrollLeft', {
  get () {
    return document.documentElement.scrollLeft
  }
})
Object.defineProperty(document, 'scrollTop', {
  get () {
    return document.documentElement.scrollTop
  }
})


const entryMap = {
  'pictureonline': {
    local: 'http://localhost:8081',
    development: 'http://fed.dev.hzmantu.com/picture-online-web/index.html',
    production: 'https://picture.hzmantu.com/picture-online-web/index.html',
  }
}

/*
 *主应用的生命周期
 * (这不是必须的，可以省略)
 *
 * */
const mainLifeCycles = {
  beforeLoad: [
    app => {
      console.log('[LifeCycle] before load %c%s', 'color: green;', app.name)
    }
  ],
  beforeMount: [
    app => {
      console.log('[LifeCycle] before mount %c%s', 'color: green;', app.name)
    }
  ],
  afterUnmount: [
    app => {
      console.log('[LifeCycle] after unmount %c%s', 'color: green;', app.name)
    }
  ]
}

const apps = [
  {
    name: 'pictureonline', // 需和子项目 vue.config.js 中 name 相同
    container: '#picture-online',
    // activeRule: genActiveRule('#/watcher-online'),
    props: {
      getXStreamId: () => SessionTool.getXStreamId(),
      DownIpc: () => DownIpc,
      store: () => store
    }
  }
]

apps.forEach(app => {
  app.entry = readConfig('microWeb') || entryMap[app.name][process.env.VUE_APP_SERVER_MODE]
})

// 预加载 应用
export function prefetchMicroApps () {
  prefetchApps(apps)
}

// 注册所有 应用
export function registerApps () {
  registerMicroApps(apps, mainLifeCycles)
  prefetchMicroApps()
  start({
    sandbox: { strictStyleIsolation: true },
    excludeAssetFilter: (assetUrl) => {
      if (assetUrl.includes('pingjs.qq.com')) return true
      return false
    }
  })
}

// 指定加载某子应用
export function loadApp (i = 0) {
  console.log(apps[i])
  loadMicroApp(apps[i], {
    sandbox: { strictStyleIsolation: true },
    excludeAssetFilter: (assetUrl) => {
      if (assetUrl.includes('pingjs.qq.com')) return true
      return false
    }
  })
}

// 增加错误监听
addGlobalUncaughtErrorHandler(error => console.error(error))
