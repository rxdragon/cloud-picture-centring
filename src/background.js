/* eslint-disable no-console */
'use strict'
/* global __static */

import { app, protocol } from 'electron'
import EventEmitter from 'events'
import { installVueDevtools } from 'vue-cli-plugin-electron-builder/lib'

// !!! 不要修改此文件，修改此文件没有任何作用，请修改对应 starter 项目文件 !!!
global.env = process.env.NODE_ENV || 'dev'
global.isDevelopment = global.env !== 'production'
global.isTest = !!process.env.IS_TEST
global.initWindow = null
global.successInit = false
global.userDir = app.getPath('userData')
global.emit = new EventEmitter()

// 注意，此处的 staticDir 实际指向 starter 项目的 public 文件夹
global.staticDir = __static

global.isInSingleMode = global.env !== 'production'

// 由 starter 管理的配置项
global.config = () => undefined

console.log(`cache dir: ${global.userDir}`)

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'cloud', privileges: { secure: true, standard: true } }])

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  app.quit()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (global.isDevelopment && !global.isTest) {
    // Install Vue Devtools
    // Devtools extensions are broken in Electron 6.0.0 and greater
    // See https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378 for more info
    // Electron will not launch with Devtools extensions installed on Windows 10 with dark mode
    // If you are not using Windows 10 dark mode, you may uncomment these lines
    // In addition, if the linked issue is closed, you can upgrade electron and uncomment these lines
    try {
      await installVueDevtools()
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  require('./background-main')
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
