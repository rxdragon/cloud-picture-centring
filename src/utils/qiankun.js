/* eslint-disable no-console */
import { prefetchApps, registerMicroApps, loadMicroApp, start, addGlobalUncaughtErrorHandler } from 'qiankun'
import * as SessionTool from '@/utils/sessionTool'
import DownIpc from '@electronMain/ipc/DownIpc'

const entryMap = {
  'pictureonline': {
    local: '//localhost:8081',
    development: '//fed.dev.hzmantu.com/picture-online-web/index.html',
    // TODO
    production: '//release_2_0_0-himo_picture_online_web_v2.fed-dev.hzmantu.com',
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
      DownIpc: DownIpc
    }
  }
]

apps.forEach(app => {
  app.entry = entryMap[app.name][process.env.VUE_APP_SERVER_MODE]
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
