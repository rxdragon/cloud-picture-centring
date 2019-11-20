const { app } = require('electron').remote

export function getFileIcon (path) {
  return new Promise((resolve) => {
    const defaultIcon = 'some-default.jpg'
    if (!path) return resolve(defaultIcon)
    return app.getFileIcon(path, (err, nativeImage) => {
      if (err) {
        return resolve(defaultIcon)
      }
      return resolve(nativeImage.toDataURL()) // 使用base64展示图标
    })
  })
}
