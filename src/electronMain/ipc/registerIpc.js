import { startNetworkDebugWindow } from '../window/networkDebug.js'
import { startWorkbenchWindow } from '../window/workbenchWindow.js'
import { closeWindow, windows } from '../window/base'
const { ipcMain } = require('electron')

export default function registerIpc () {
  // 当需要获取配置项时
  ipcMain.on('config:get', (event, name) => {
    if (!global.config || !global.config(name)) {
      event.returnValue = ''
      return
    }
    event.returnValue = global.config(name)
  })


  // 当用户触发升级操作
  ipcMain.on('version:do-upgrade', () => {
    // 这里处理唤起升级的逻辑，下面一句话将会触发升级并重启
    global.emit.emit('version:do-upgrade')
  })

  ipcMain.on('network-debug', async (event, url) => {
    await startNetworkDebugWindow(url)
    event.returnValue = 'success'
  })

  ipcMain.on('workbench-window', async (event, url) => {
    await startWorkbenchWindow(url)
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
