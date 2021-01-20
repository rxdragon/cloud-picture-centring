import { startOtherWindow } from "./base"
import { WINDOW_NAME } from './WindowEnumerate'

/**
 * @description 开启debug 窗口
 */
export async function startWorkbenchWindow (url) {
  await startOtherWindow(WINDOW_NAME.WORKBENCH, url, {
    width: 400,
    height: 400,
    minWidth: 400,
    minHeight: 400,
    // resizable: true,
    resizable: false,
    closable: false,
    minimizable: false,
    maximizable: false,
    // transparent: true,
    alwaysOnTop: true,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: true,
      scrollBounce: true,
      backgroundThrottling: true
    }
  })
}
