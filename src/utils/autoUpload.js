import path from 'path'
import mime from 'mime'
import * as originalFs from 'original-fs'
import { newMessage } from '@/utils/message.js'
const { app } = require('electron').remote

/**
 * @description 获取文件
 * @param {*} streamNum
 */
export function getFiles (streamNum) {
  return new Promise(async (resolve, reject) => {
    try {
      const downloadPath = app.getPath('desktop') // 桌面地址
      const readfilePath = path.join(downloadPath, streamNum) // 文件地址
      const files = await filterFiles(readfilePath)
      const readFileArray = []
      files.forEach(async fileNameItem => {
        const filePath = path.join(readfilePath, fileNameItem)
        const fileBuffer = await originalFs.readFileSync(filePath)
        const newFile = new window.File([fileBuffer], fileNameItem, { type: getFileMime(fileNameItem) })
        readFileArray.push(newFile)
      })
      resolve(readFileArray)
    } catch (error) {
      if (error.message.includes('no such file or directory')) {
        newMessage.error('找不到路径')
      }
      console.dir(error)
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
 * @description 读取文件类型
 * @param {*} fileName
 */
export function getFileMime (fileName) {
  let type
  const ext = path.extname(fileName)
  if (ext.length > 2) { type = mime.getType(ext.substring(1)) }
  return type
}
