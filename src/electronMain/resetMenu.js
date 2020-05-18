const { app, BrowserWindow, Menu, dialog } = require('electron')
import path from 'path'

const name = app.getName()
const template = [{
  label: name,
  submenu: [{
    label: '复制',
    accelerator: 'CmdOrCtrl+C',
    role: 'copy'
  }, {
    label: '粘贴',
    accelerator: 'CmdOrCtrl+V',
    role: 'paste'
  }, {
    label: '全选',
    accelerator: 'CmdOrCtrl+A',
    role: 'selectAll'
  }, {
    label: '剪切',
    accelerator: 'CmdOrCtrl+X',
    role: 'cut'
  }, {
    label: '重新加载',
    accelerator: '',
    click: function (item, focusedWindow) {
      if (focusedWindow) {
        if (focusedWindow.id === 1) {
          BrowserWindow.getAllWindows().forEach(function (win) {
            if (win.id > 1) {
              win.close()
            }
          })
        }
        focusedWindow.reload()
      }
    }
  }, {
    label: '打开调试器',
    accelerator: 'CmdOrCtrl+I',
    click: function (item, focusedWindow) {
      if (focusedWindow) {
        if (focusedWindow.webContents.isDevToolsOpened()) {
          focusedWindow.webContents.closeDevTools()
        } else {
          focusedWindow.webContents.openDevTools()
        }
      }
    }
  }]
}, {
  label: '关于',
  submenu: [{
    label: '版本',
    click: function (item, focusedWindow) {
      dialog.showMessageBoxSync({
        type: 'info',
        title: '版本号',
        icon: path.join(global.staticDir, 'icon.png'),
        message: global.currentVersion
      })
    }
  }]
}]

/**
 * @description 初始化菜单
 */
export function setMenu () {
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
