import { newMessage } from '@/utils/message'
import { registerMicroApps, addGlobalUncaughtErrorHandler, start } from 'qiankun'

// 子应用注册信息
import apps from "./app"

/**
 * @description 注册子应用
 * @param {*} apps 子应用的注册信息
 * @param {object} 全局生命周期钩子
 */
registerMicroApps(apps, {
  // qiankun 生命周期钩子 - 加载前
  beforeLoad: (app) => {
    // eslint-disable-next-line no-console
    console.log("before load", app.name)
    return Promise.resolve()
  },
  // qiankun 生命周期钩子 - 挂载后
  afterMount: (app) => {
    // eslint-disable-next-line no-console
    console.log("after mount", app.name)
    return Promise.resolve()
  },
})

/**
 * 添加全局的未捕获异常处理器
 */
addGlobalUncaughtErrorHandler((event) => {
  console.error(event)
  const { message: msg } = event
  // 加载失败时提示
  if (msg && msg.includes("died in status LOADING_SOURCE_CODE")) {
    newMessage.error("子应用加载失败，请检查应用是否可运行")
  }
})

// 导出 qiankun 的启动函数
export default start
