import { BrowserWindow } from "electron"

const windows = {}

/**
 * @description 创建窗口
 * @param {*} name 窗口名字
 * @param {*} url 地址
 * @param {*} options 选项
 */
export async function startWindow (name, url, options) {
  if (!windows[name]) {
    options.show = false
    const win = new BrowserWindow(options)
    windows[name] = win

    win.on('ready-to-show', () => {
      win.show()
    })

    win.on('closed', () => {
      delete windows[name]
    })

    if (process.env.WEBPACK_DEV_SERVER_URL) {
      // Load the url of the dev server if in development mode
      await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL + `#${url}`)
    } else {
      // Load the index.html when not in development
      await win.loadURL(`cloud://${global.env}/index.html#${url}`)
    }

    if (global.isDevelopment) win.webContents.openDevTools({ mode: "detach" })
  } else {
    windows[name].focus()
  }
}
