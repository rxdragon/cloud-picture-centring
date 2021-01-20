import mime from 'mime'
import store from '@/store'
import Vue from 'vue'
import * as originalFs from 'original-fs'
import * as mPath from '@/utils/selfPath.js'
import * as PhotoTool from '@/utils/photoTool'
import { OPERATION_TYPE } from '@/api/autoRetouch'
const { ipcRenderer } = require('electron')

/**
 * @description 获取自动修图图片
 * 获取优先级，先warp crop 原图
 */
function getAutoPHoto (readfilePath, filePath) {
  const prioritySequence = [
    `${OPERATION_TYPE.CROP}${OPERATION_TYPE.WARP}${OPERATION_TYPE.RETOUCH}${OPERATION_TYPE.MATTING}`,
    `${OPERATION_TYPE.CROP}${OPERATION_TYPE.RETOUCH}${OPERATION_TYPE.MATTING}`,
    `${OPERATION_TYPE.CROP}${OPERATION_TYPE.WARP}${OPERATION_TYPE.MATTING}`,
    `${OPERATION_TYPE.CROP}${OPERATION_TYPE.WARP}${OPERATION_TYPE.RETOUCH}`,
    `${OPERATION_TYPE.CROP}${OPERATION_TYPE.WARP}`,
    `${OPERATION_TYPE.CROP}${OPERATION_TYPE.RETOUCH}`,
    `${OPERATION_TYPE.CROP}${OPERATION_TYPE.MATTING}`,
  ]

  const ext = PhotoTool.getFilePostfix(filePath)
  const name = PhotoTool.fileNameFormat(filePath)
  let autoLocalPath = ''
  for (const model of prioritySequence) {
    const autoPath = `${name}~${model}${ext}`
    const localPath = mPath.joinPath(readfilePath, autoPath)
    if (originalFs.existsSync(localPath)) {
      autoLocalPath = autoPath
      break
    }
  }
  return autoLocalPath || filePath
}

/**
 * @description 获取文件
 * @param {*} streamNum
 */
export function getFiles (streamNum, needUploadPhotos) {
  const downloadPath = store.getters.saveFolder // 保存地址
  const readfilePath = mPath.joinPath(downloadPath, streamNum) // 文件地址
  const noFilePath = []
  const handlerPath = []
  needUploadPhotos.forEach(fileNameItem => {
    // 获取图片地址
    const realFileName = getAutoPHoto(readfilePath, fileNameItem)
    const filePath = mPath.joinPath(readfilePath, realFileName)
    // 判断文件存不存在
    if (!originalFs.existsSync(filePath)) {
      noFilePath.push(fileNameItem)
    } else {
      handlerPath.push(filePath)
    }
  })
  if (!handlerPath.length) throw new Error(`${readfilePath}文件夹不存在`)
  if (noFilePath.length) {
    let errorMessage = `<p>以下文件不存在：</p>`
    noFilePath.forEach(pathItem => {
      errorMessage += `<p class="message-p"><i>${ pathItem }</i></p>`
    })
    Vue.prototype.$newMessage({
      type: 'error',
      message: errorMessage,
      dangerouslyUseHTMLString: true,
      duration: 4000
    })
  }
  ipcRenderer.send('select-file', { filePath: handlerPath })
}

/**
 * @description 过滤文件夹
 * @param {*} readfilePath 读取文件夹地址
 */
export async function filterFiles (readfilePath) {
  const files = await originalFs.readdirSync(readfilePath)
  const photoMime = ['image/jpeg', 'image/png']
  const filterData = files.filter(item => photoMime.includes(getFileMime(item)))
  return filterData
}

/**
 * @description 读取文件类型
 * @param {*} fileName
 */
export function getFileMime (fileName) {
  let type
  const ext = mPath.getExtName(fileName)
  if (ext.length > 2) {
    type = mime.getType(ext.substring(1))
  }
  return type
}
