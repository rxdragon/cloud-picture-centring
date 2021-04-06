/* eslint-disable no-console */
import { app, globalShortcut } from 'electron'
// import { startAboutWindow } from "@/background/window/about"
const { BrowserWindow } = require('electron')

/**
 * @description 初始化菜单
 */
export function setGlobalShortcut () {
  return new Promise((reslove) => {
    app.whenReady().then(() => {
      globalShortcut.register('CmdOrCtrl+I', () => {
        console.log('CmdOrCtrl+I')
        
        const focusedWindow = BrowserWindow.getFocusedWindow()
        if (focusedWindow) {
          if (focusedWindow.webContents.isDevToolsOpened()) {
            focusedWindow.webContents.closeDevTools({ mode: "detach" })
          } else {
            focusedWindow.webContents.openDevTools({ mode: "detach" })
          }
        }
      })

      globalShortcut.register('CmdOrCtrl+R', () => {
        console.log('CmdOrCtrl+R')

        const focusedWindow = BrowserWindow.getFocusedWindow()
        if (focusedWindow) {
          if (focusedWindow.id === 1) {
            BrowserWindow.getAllWindows().forEach(async function (win) {
              const ses = win.webContents.session
              await ses.clearHostResolverCache()
              const cacheSize = await ses.getCacheSize()
              const cacheSizeMB = cacheSize / 1024 / 1024
              // eslint-disable-next-line no-console
              console.log(`\x1b[42;30m 当前缓存 \x1b[40;32m ${cacheSizeMB}MB`)
              await ses.clearCache()
              if (win.id > 1) { win.close() }
            })
          }
          focusedWindow.reload()
        }
      })

      globalShortcut.register('CmdOrCtrl+M', (item, focusedWindow) => {
        console.log('CmdOrCtrl+M')
        // TODO 关闭菜单
        // startAboutWindow()
      })
    }).then(reslove())
  })
}
