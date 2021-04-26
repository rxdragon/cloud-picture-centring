import { startWindow } from "./base"
import { WINDOW_NAME } from './WindowEnumerate'

/**
 * @description 开启debug 窗口
 */
export async function startNetworkDebugWindow (url) {
  await startWindow(WINDOW_NAME.NETWORK_DEBUG, `/network-debug?imageUrl=${url}`, {
    width: 800,
    height: 800,
    minWidth: 800,
    minHeight: 800,
    resizable: true,
    closable: true,
    minimizable: false,
    maximizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  })
}
