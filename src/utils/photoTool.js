import { ipcRenderer } from 'electron'
import { PhotoEnum, NoReturnPhotoEnum, ReturnOnePhotoEnum } from '@/utils/enumerate.js'
import store from '@/store' // vuex
import Vue from 'vue'

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
 * @param {*} reworkTimes 重修次数
 */
export function settlePhoto (photoArr, reworkTimes = 0) {
  const PhotoEnumArr = [NoReturnPhotoEnum, ReturnOnePhotoEnum, PhotoEnum]
  const createData = []
  const PhotoEnums = reworkTimes < 2 ? PhotoEnumArr[reworkTimes] : PhotoEnumArr[2]
  for (const key in PhotoEnums) {
    const version = PhotoEnums[key]
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
  Vue.prototype.$newMessage.success(`已添加${photoArr.length}张照片`)
  photoArr.forEach(item => {
    item.url = imgDomain + item.url
    ipcRenderer.send('downPhoto', item)
  })
}
