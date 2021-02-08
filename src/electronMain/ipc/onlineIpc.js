
const { ipcMain } = require('electron')
import { WINDOW_NAME } from '../window/WindowEnumerate'

let onlineCount = 0

export default function onlineIpc (windows) {
  // 当需要获取配置项时
  ipcMain.on('online-count:get', (event) => {
    event.returnValue = onlineCount
  })

  // 当需要获取配置项时
  ipcMain.on('online-count:set', (event, count) => {
    onlineCount = count
    if (windows['main']) {
      windows['main'].browserWindowObject.webContents.send(`online-count:change`, count)
    }
    if (windows[WINDOW_NAME.WORKBENCH]) {
      windows[WINDOW_NAME.WORKBENCH].browserWindowObject.webContents.send(`online-count:change`, count)
    }
    event.returnValue = onlineCount
  })

  // 更新retouch相关信息
  ipcMain.on('upload-workbench', (event, data) => {
    if (windows['main']) {
      windows['main'].browserWindowObject.webContents.send(`workbench-change`, data)
    }
    if (windows[WINDOW_NAME.WORKBENCH]) {
      windows[WINDOW_NAME.WORKBENCH].browserWindowObject.webContents.send(`workbench-change`, data)
    }
    event.returnValue = 'success'
  })
}
