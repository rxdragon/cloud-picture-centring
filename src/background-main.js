'use strict'

// 下方代码回被 webpack 处理为正确的 require
const { app, BrowserWindow, ipcMain } = require('electron')
import path from 'path'
import initDownloadManager from './electronMain/downTool'
import initDialog from './electronMain/dialog'
import initUtils from './electronMain/utils'
import registerIpc from './electronMain/ipc/registerIpc'
import onlineIpc from './electronMain/ipc/onlineIpc'
import initExecIncident from './electronMain/execNode'
import { setMenu } from './electronMain/resetMenu.js'
import { windows } from './electronMain/window/base'
import WindowsModel from './electronMain/window/WindowModel'
require('./electronMain/LocalServe')

app.commandLine.appendArgument("--enable-features=Metal")

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

// 初始化菜单
setMenu()

async function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1440,
    height: 900,
    show: false,
    minWidth: 1440,
    minHeight: 900,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInSubFrames: false,
      scrollBounce: true,
      backgroundThrottling: true
    },
    titleBarStyle: 'hiddenInset',
    icon: path.join(global.staticDir, 'icon.png'),
    preload: path.join(__dirname, './electronMain/renderer.js'),
    offscreen: false
  })

  // 注册信息
  windows['main'] = new WindowsModel('main', win)

  // 清空http-cache
  const ses = win.webContents.session
  await ses.clearHostResolverCache()
  const cacheSize = await ses.getCacheSize()
  const cacheSizeMB = cacheSize / 1024 / 1024
  // eslint-disable-next-line no-console
  console.log(`\x1b[42;30m 当前缓存 \x1b[40;32m ${cacheSizeMB}MB\x1B[0m`)
  await ses.clearCache()

  // 窗口关闭前触发
  win.on('close', () => {
    win.webContents.send('closed-win')

    for (const browserWindowItem of Object.values(windows)) {
      browserWindowItem.browserWindowObject.destroy()
    }
  })
  // 窗口关闭后触发
  win.on('closed', () => {
    win = null
  })
  // 进入全屏状态
  win.on('enter-full-screen', () => {
    win.webContents.send('enter-full')
  })
  // 退出全屏状态
  win.on('leave-full-screen', () => {
    win.webContents.send('leave-full')
  })

  win.on('resize', () => {
    const data = win.getSize()
    win.webContents.send('win-resize', { data })
  })

  win.webContents.on('new-window', (event, url) => {
    event.preventDefault()
  })

  // 注册下载监听
  initDownloadManager(win, ipcMain)
  // 注册文件弹框事件
  initDialog(win, ipcMain)
  initUtils(win, ipcMain)
  initExecIncident(win, ipcMain)
  // 注册主线程事件
  registerIpc(win)
  // 注册在线状态onlineIpc
  onlineIpc(windows)

  // ready-to-show 一定要在 loadURL 前注册，不然会引发随机性 bug
  win.once('ready-to-show', () => {
    if (win) win.show()
    if (global.initWindow) global.initWindow.close()
  })

  // 当 starter 找到新的版本
  global.emit.on('version:find-new', (info) => {
    // 这里处理准备升级的逻辑
    if (win) win.webContents.send('version:find-new', info)
  })


  if (global.isDevelopment && global.isInSingleMode) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!global.isTest) win.webContents.openDevTools()
  } else {
    await win.loadURL('cloud://' + global.env + '/index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  app.quit()
})

app.on('activate', async () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    // app.commandLine.appendSwitch('ignore-gpu-blacklist')
    await createWindow()
  }
})

// Exit cleanly on request from parent process in development mode.
if (global.isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

createWindow().then()
