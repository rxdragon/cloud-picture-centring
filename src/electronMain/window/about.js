import { ipcMain } from "electron"
import { startWindow } from "./base.js"
import { Background } from "../interface/event"

ipcMain.handle(Background.Handle.GetVersion, () => {
  return {
    launcherVersion: global.launcherVersion,
    isDevelopment: global.isDevelopment,
    isTest: global.isTest,
    currentVersion: global.currentVersion,
  }
})

export async function startAboutWindow () {
  await startWindow("about", "/about", {
    width: 400,
    height: 160,
    minWidth: 400,
    minHeight: 160,
    resizable: false,
    closable: true,
    minimizable: false,
    maximizable: false,
    webPreferences: {
      nodeIntegration: true
    }
  })
}
