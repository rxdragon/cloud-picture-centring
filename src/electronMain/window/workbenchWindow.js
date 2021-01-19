import { startOtherWindow } from "./base"

/**
 * @description 开启debug 窗口
 */
export async function startWorkbenchWindow (url) {
  await startOtherWindow("workbench", url, {
    width: 800,
    height: 800,
    minWidth: 800,
    minHeight: 800,
    resizable: true,
    closable: true,
    minimizable: false,
    maximizable: false,
    // transparent: true,
    alwaysOnTop: true,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: true
    }
  })
}
