/* eslint-disable no-console */
import { app, ipcMain } from 'electron'
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer"

import { createWindow } from "./window/mainWindow.js"
import { setGlobalShortcut } from './globalShortcut.js'
import { windows } from './window/base'

import Upgrade from "./upgrade.js"

import initDownloadManager from './downTool'
import initDialog from './dialog'
import initUtils from './utils'
import registerIpc from './ipc/registerIpc'
import onlineIpc from './ipc/onlineIpc'
import initDiagnoseNetWork from './ipc/diagnoseNetWork'
import initExecIncident from './execNode'
import { setMenu } from './resetMenu.js'

require('./LocalServe')

app.commandLine.appendArgument("--enable-features=Metal")

let isDevToolInit = false
let mainWin = null

/**
 * @description 安装vue调试器
 */
async function initDevTools () {
  console.log(isDevToolInit, 'isDevToolInit')
  console.log(global.isDevelopment, 'global.isDevelopment')
  console.log(global.isTest, 'global.isTest')
  console.log(!isDevToolInit && global.isDevelopment && !global.isTest, 'initDevTools')

  if (!isDevToolInit && global.isDevelopment && !global.isTest) {
    isDevToolInit = true

    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
}

/**
 * @description 注册配置相关通信信息
 * @param {*} win 渲染进程窗口信息
 */
function initPlugins (win) {
  try {
    // 初始化监听弹框
    initDialog(win, ipcMain)

    // 初始化下载管理器
    initDownloadManager(win, ipcMain)

    // 注册工具类信息
    initUtils(win, ipcMain)

    // 注册命令行工具
    initExecIncident(win, ipcMain)

    // 注册网络接口
    initDiagnoseNetWork(win, ipcMain)

    // 初始化ipc通道信息
    registerIpc(win, ipcMain)

    // 注册控制面板相关工具
    onlineIpc(windows)

  } catch (error) {
    console.log(error)
  }
}

/**
 * @description 读取网页地址
 * @param {*} params 
 */
async function loadUrl (win) {
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    console.log(process.env.WEBPACK_DEV_SERVER_URL)
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL + '/index.html')
    if (global.isDevelopment) win.webContents.openDevTools({ mode: "detach" })
  } else {
    // Load the index.html when not in development
    await win.loadURL(`app://./index.html`)
  }
}

/**
 * @description 初始化app
 */
export async function initApp () {
  app.on('window-all-closed', () => {
    app.quit()
  })
  console.log(`\x1b[42;30m 安装插件中 \x1B[0m`)
  await initDevTools()
  console.log(`\x1b[42;30m 创建应用主窗口 \x1B[0m`)
  console.log(process.platform)
  const platform = process.platform
  if (platform === 'darwin') {
    // 初始化菜单
    setMenu()
  } else {
    await setGlobalShortcut()
  }

  mainWin = await createWindow()

  // 注册相关信息
  initPlugins(mainWin)

  // 读取信息
  loadUrl(mainWin)

  // 如果在启动器中打开 打开启动器
  if (global.launcher){
    const upgradeUtil = new Upgrade()
    // 开启检测更新
    upgradeUtil.startUpgradeCheck()
    // 关闭启动器
    global.launcher.closeLauncher()
  }
}
