import { startWindow } from "./base"

/**
 * @description 开启debug 窗口
 */
export async function startNetworkDebugWindow (url) {
  await startWindow("network-debug", `/network-debug?imageUrl=${url}`, {
    width: 800,
    height: 800,
    minWidth: 800,
    minHeight: 800,
    resizable: true,
    closable: true,
    minimizable: false,
    maximizable: false,
    webPreferences: {
      nodeIntegration: true
    }
  })
}
