import { ipcRenderer } from 'electron'
import { PhotoEnum } from '@/utils/enumerate.js'
import store from '@/store' // vuex

/**
 * @description 截取文件名
 * @param {*} name
 */
export function fileNameFormat (name) {
  const indexPoint = name.lastIndexOf('.')
  return name.substring(0, indexPoint)
}

/**
 * @description 处理图片地址
 * @param {String} path 图片地址
 * @param {String} type 系统类型，外包系统相关(bpo)，云端系统相关(cloud)，云学院相关(cschool)，不传默认为：云端
 */
export function handlePicPath (path, type) {
  let resPath = ''
  // 线上环境存储目录
  const prodFilePath = '/upload/'
  // 开发环境存储目录
  const devFilePath = '/upload_dev/'
  resPath = (path.replace(devFilePath, '')).replace(prodFilePath, '')
  return resPath
}

/**
 * @description 超着照片版本
 * @param {*} photoArr
 */
export function settlePhoto (photoArr) {
  const createData = []
  for (const key in PhotoEnum) {
    const version = PhotoEnum[key]
    const findVersionPhoto = photoArr.find(photoItem => photoItem.version === version)
    if (findVersionPhoto) { createData.push(findVersionPhoto) }
  }
  return createData
}

/**
 * @description 一键下载
 * @param {*} photoArr
 */
export function oneAllDown (photoArr) {
  const imgDomain = store.getters.imgDomain
  photoArr.forEach(item => {
    item.url = imgDomain + item.url
    ipcRenderer.send('downPhoto', item)
  })
}
