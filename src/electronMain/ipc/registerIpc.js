import { startNetworkDebugWindow } from '../window/networkDebug.js'
import { startWorkbenchWindow } from '../window/workbenchWindow.js'
import { closeWindow, windows } from '../window/base'
import { WINDOW_NAME } from '../window/WindowEnumerate'
const { ipcMain, app } = require('electron')

export default function registerIpc (win) {
  ipcMain.on('close-app', (event, name) => {
    win.close()
    event.returnValue = 'success'
  })

  // 当需要获取配置项时
  ipcMain.on('config:get', (event, name) => {
    if (!global.config || !global.config[name]) {
      event.returnValue = ''
      return
    }
    event.returnValue = global.config[name]
  })

  // 获取路径配置
  ipcMain.on('app:getPath', (event, path) => {
    try {
      event.returnValue = app.getPath(path)
    } catch {
      event.returnValue = ''
    }
  })

  // 获取图标地址
  ipcMain.on('app:getFileIcon', (event, path) => {
    app.getFileIcon(path, (err, nativeImage) => {
      if (err) {
        event.returnValue = ''
      }
      event.returnValue = nativeImage.toDataURL() // 使用base64展示图标
    })
  })

  ipcMain.on('network-debug', async (event, url) => {
    await startNetworkDebugWindow(url)
    event.returnValue = 'success'
  })

  ipcMain.on('workbench-window', async (event, url) => {
    await startWorkbenchWindow(url)
    event.returnValue = 'success'
  })

  // 重制窗口大小
  ipcMain.on('resize-workbench', async (event, data) => {
    if (!windows[WINDOW_NAME.WORKBENCH]) {
      event.returnValue = 'fail'
      return
    }
    const { width, height } = data
    windows[WINDOW_NAME.WORKBENCH].browserWindowObject.setContentSize(width, height, true)
    event.returnValue = 'success'
  })

  ipcMain.on('close-window', async (event, windowName) => {
    closeWindow(windowName)
    event.returnValue = 'success'
  })

  ipcMain.on('other-window-down', async (event, data) => {
    if (!windows['main']) {
      event.returnValue = 'fail'
      return
    }
    windows['main'].browserWindowObject.webContents.send('main-window-down', data)
    event.returnValue = 'success'
  })
}
