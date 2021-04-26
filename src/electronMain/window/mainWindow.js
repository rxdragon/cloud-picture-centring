
import { BrowserWindow } from "electron"
import path from 'path'
import { windows } from './base.js'
import WindowsModel from '../window/WindowModel.js'

export async function createWindow () {
  let win = new BrowserWindow({
    width: 1440,
    height: 900,
    show: false,
    minWidth: 1440,
    minHeight: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      nodeIntegrationInSubFrames: false,
      scrollBounce: true,
      backgroundThrottling: true
    },
    titleBarStyle: 'hiddenInset',
    icon: path.join(global.launcherStaticDir, "icon.png"),
    preload: path.join(__dirname, '../renderer.js'),
    offscreen: false
  })

  windows['main'] = new WindowsModel('main', win)

  // 清理缓存
  await cleanHttpCache(win)

  // 监听相关事件
  /**
   * @description 窗口关闭前触发
   */
  win.on('close', () => {
    win.webContents.send('closed-win')
    
    for (const browserWindowItem of Object.values(windows)) {
      browserWindowItem.browserWindowObject.destroy()
    }
  })

  /**
   * @description 窗口关闭后触发
   */
  win.on('closed', () => {
    win = null
  })

  /**
   * @description 进入全屏状态
   */
  win.on('enter-full-screen', () => {
    win.webContents.send('enter-full')
  })

  /**
   * @description 退出全屏状态
   */
  win.on('leave-full-screen', () => {
    win.webContents.send('leave-full')
  })

  /**
   * @description 监听重制窗口大小
   */
  win.on('resize', () => {
    const data = win.getSize()
    win.webContents.send('win-resize', { data })
  })

  /**
   * @description 监听新建窗口
   */
  win.webContents.on('new-window', (event, url) => {
    event.preventDefault()
  })

  /**
   * @description 显示窗口
   */
  win.once('ready-to-show', () => {
    if (win) win.show()
  })

  return win
}

/**
 * @description 清空缓存
 * @param {*} win 
 */
export async function cleanHttpCache (win) {
  const ses = win.webContents.session
  await ses.clearHostResolverCache()
  const cacheSize = await ses.getCacheSize()
  const cacheSizeMB = cacheSize / 1024 / 1024
  // eslint-disable-next-line no-console
  console.log(`\x1b[42;30m 当前缓存 \x1b[40;32m ${cacheSizeMB}MB\x1B[0m`)
  await ses.clearCache()
}

