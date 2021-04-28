/* eslint-disable no-console */
import { ipcMain } from "electron"
import { startWindow } from "./base.js"
import { Background } from "../interface/event"

ipcMain.on(Background.Event.NewVersionRestart, () => {
  if (global.launcher) {
    global.launcher.restart()
  } else {
    console.log("fire Background.Event.NewVersionRestart")
  }
})

/**
 * @description 启动新版本更新窗口
 */
export async function startNewVersionWindow () {
  await startWindow("new-version", "/new_version", {
    width: 400,
    height: 150,
    minWidth: 430,
    minHeight: 150,
    resizable: true,
    closable: false,
    minimizable: false,
    maximizable: false,
    frame: false,
    titleBarStyle: {
      hidden: true
    },
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })
}
