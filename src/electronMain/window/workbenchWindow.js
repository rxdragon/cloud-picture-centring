import { startOtherWindow } from "./base"
import { WINDOW_NAME } from './WindowEnumerate'

/**
 * @description 开启debug 窗口
 */
export async function startWorkbenchWindow ({ url, width, height }) {
  await startOtherWindow(WINDOW_NAME.WORKBENCH, url, {
    width: width || 400,
    height: height || 400,
    minWidth: 400,
    maxWidth: 400,
    minHeight: 100,
    resizable: false,
    closable: false,
    minimizable: false,
    maximizable: false,
    transparent: true,
    hasShadow: false,
    alwaysOnTop: true,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      scrollBounce: true,
      backgroundThrottling: true
    }
  })
}
