'use strict'

// 下方代码回被 webpack 处理为正确的 require
const { app, BrowserWindow, ipcMain } = require('electron')
import path from 'path'
import initDownloadManager from './electronMain/downTool'
import initDialog from './electronMain/dialog'
import initExecIncident from './electronMain/execNode'
import { setMenu } from './electronMain/resetMenu.js'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

// 初始化菜单
setMenu()

async function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1440,
    height: 800,
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
    preload: path.join(__dirname, './electronMain/renderer.js')
  })

  // 窗口关闭前触发
  win.on('close', () => {
    win.webContents.send('closed-win')
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

  win.webContents.on('new-window', (event, url) => {
    event.preventDefault()
  })

  // 注册下载监听
  initDownloadManager(win, ipcMain)
  // 注册文件弹框事件
  initDialog(win, ipcMain)
  initExecIncident(win, ipcMain)

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

  // 当用户触发升级操作
  ipcMain.on('version:do-upgrade', () => {
    // 这里处理唤起升级的逻辑，下面一句话将会触发升级并重启
    global.emit.emit('version:do-upgrade')
  })

  // 当需要获取配置项时
  ipcMain.on('config:get', (event, name) => {
    event.returnValue = global.config(name)
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
