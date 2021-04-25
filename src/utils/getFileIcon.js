const { ipcRenderer } = require('electron')

export function getFileIcon (path) {
  return new Promise((resolve) => {
    const defaultIcon = 'some-default.jpg'
    if (!path) return resolve(defaultIcon)

    const iconPath = ipcRenderer.sendSync('app:getFileIcon', path)
    if (!iconPath) return resolve(defaultIcon)
    return resolve(iconPath)
  })
}
