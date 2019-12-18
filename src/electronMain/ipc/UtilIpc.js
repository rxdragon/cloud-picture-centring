const { ipcRenderer } = require('electron')
import * as mPath from '@/utils/selfPath.js'

/**
 * @description 获取md5值
 * @param {*} filePath
 */
async function getImgBufferPhoto (filePath) {
  return new Promise((resolve, reject) => {
    ipcRenderer.send('get-img-info', { filePath })
    const ext = mPath.getExtName(filePath)
    const name = mPath.getBaseName(filePath, ext)
    ipcRenderer.on(`get-img-info-return-${name}`, (event, { state, msg }) => {
      if (state === 'success') {
        resolve(msg)
      } else {
        reject(msg)
      }
    })
  })
}

export default {
  getImgBufferPhoto
}
