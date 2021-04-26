/* eslint-disable no-console */
'use strict'

import { app, Menu, protocol } from 'electron'
import EventEmitter from 'events'
import path from 'path'

// !!! 不要修改此文件，修改此文件没有任何作用，请修改对应 mainto-tech-utilities-launcher 项目文件 !!!
global.launcherVersion = 'inline-launcher'
global.env = process.env.NODE_ENV || 'dev'
global.isDevelopment = global.env !== 'production'
global.isTest = !!process.env.IS_TEST
global.currentVersion = "local-dev"
global.successInit = false
global.userDir = app.getPath("userData")
global.emit = new EventEmitter.EventEmitter()
// eslint-disable-next-line no-undef
global.launcherStaticDir = __static
// eslint-disable-next-line no-undef
global.staticDir = path.join(__static, "static")

global.isInSingleMode = global.env !== 'production'

global.config = {}
console.log(`cache dir: ${global.userDir}`)

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  Menu.setApplicationMenu(null)

  require("./background-main")
})
