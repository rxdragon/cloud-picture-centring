import mime from 'mime'
import store from '@/store'
import Vue from 'vue'
import * as originalFs from 'original-fs'
import * as mPath from '@/utils/selfPath.js'
const { ipcRenderer } = require('electron')

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
    const filePath = mPath.joinPath(readfilePath, fileNameItem)
    if (!originalFs.existsSync(filePath)) {
      noFilePath.push(fileNameItem)
    } else {
      handlerPath.push(filePath)
    }
  })
  if (!handlerPath.length) { throw new Error(`${readfilePath}文件夹不存在`) }
  if (noFilePath.length) {
    const errorMessage = `以下文件不存在\n${noFilePath.join(',\n')}`
    Vue.prototype.$newMessage.error(errorMessage)
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
  if (ext.length > 2) { type = mime.getType(ext.substring(1)) }
  return type
}
