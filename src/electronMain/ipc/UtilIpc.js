const { ipcRenderer } = require('electron')

/**
 * @description 获取md5值
 * @param {*} filePath
 */
function getImgBufferPhoto (filePath) {
  const result = ipcRenderer.sendSync('get-img-info', { filePath })
  if (result.state === 'error') {
    console.log(result.msg)
    throw new Error(result.msg)
  }
  return result.msg
}

export default {
  getImgBufferPhoto
}
