import MD5 from 'md5.js'
import * as mPath from '../utils/selfPath'
const fileType = require('file-type')
const fs = require('fs')

/**
 * @description 工具
 * @param {*} win
 * @param {*} ipcMain
 */
function initUtils (win, ipcMain) {
  // 获取图片信息
  function getImgBufferInfo (event, { filePath }) {
    const ext = mPath.getExtName(filePath)
    const name = mPath.getBaseName(filePath, ext)
    try {
      console.time('md5')
      const md5stream = new MD5()
      const imgBuffer = fs.readFileSync(filePath)
      md5stream.end(imgBuffer)
      const uploadPhotoMd5 = md5stream.read().toString('hex')
      const type = fileType(imgBuffer).mime
      console.timeEnd('md5')
      const returnValue = {
        state: 'success',
        msg: { uploadPhotoMd5, type }
      }
      event.sender.send(`get-img-info-return-${name}`, returnValue)
    } catch (error) {
      const returnValue = {
        state: 'error',
        msg: error
      }
      event.sender.send(`get-img-info-return-${name}`, returnValue)
    }
  }

  ipcMain.on('get-img-info', getImgBufferInfo)
}

export default initUtils
