import mime from 'mime'
import store from '@/store'
import md5 from 'md5'
import Vue from 'vue'
import * as originalFs from 'original-fs'
import * as mPath from '@/utils/selfPath.js'
import { newMessage } from '@/utils/message.js'
const fileType = require('file-type')

/**
 * @description 获取文件
 * @param {*} streamNum
 */
export function getFiles (streamNum, needUploadPhotos) {
  return new Promise(async (resolve, reject) => {
    try {
      const downloadPath = store.getters.saveFolder // 保存地址
      const readfilePath = mPath.joinPath(downloadPath, streamNum) // 文件地址
      const readFileArray = []
      for (const fileNameItem of needUploadPhotos) {
        const filePath = mPath.joinPath(readfilePath, fileNameItem)
        const fileBuffer = await originalFs.readFileSync(filePath)
        const { mime, ext } = fileType(fileBuffer)
        const fileExt = mPath.getExtName(fileNameItem)
        if (fileExt !== `.${ext}`) {
          Vue.prototype.$newMessage.error(`${fileNameItem}格式为${ext}`)
          reject('格式错误')
        }
        const newFile = new window.File([fileBuffer], fileNameItem, { type: mime })
        readFileArray.push(newFile)
      }
      resolve(readFileArray)
    } catch (error) {
      if (error.message.includes('no such file or directory')) {
        newMessage.error('找不到路径')
      }
      reject(error)
    }
  })
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
 * @description 根据路径获取md5
 * @param {*} path
 */
export async function reasonPathGetMd5 (path) {
  try {
    const imgBuffer = await originalFs.readFileSync(path)
    return md5(imgBuffer)
  } catch (error) {
    if (error.message.includes('no such file or directory')) {
      newMessage.error('找不到路径')
    }
    throw new Error(error)
  }
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
