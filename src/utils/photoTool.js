import { ipcRenderer } from 'electron'
import { PhotoEnum, NoReturnPhotoEnum, ReturnOnePhotoEnum } from '@/utils/enumerate.js'
import md5 from 'md5'
import store from '@/store' // vuex
import Vue from 'vue'
import * as SessionTool from '@/utils/sessionTool.js'

/**
 * @description 截取文件名
 * @param {*} name
 */
export function fileNameFormat (name) {
  const indexPoint = name.lastIndexOf('.')
  const returnName = name
  return returnName.substring(0, indexPoint)
}

/**
 * @description 获取文件后缀
 * @param {*} name
 */
export function getFilePostfix (name) {
  const indexPoint = name.lastIndexOf('.')
  return name.substring(indexPoint)
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
  Vue.prototype.$newMessage.success(`已添加${photoArr.length}张照片至下载`)
  photoArr.forEach(item => {
    item.downName = item.url
    item.url = imgDomain + item.url
    ipcRenderer.send('downPhoto', item)
  })
}

/**
 * @description 是否预加载完成图片
 * @param {*} photoArr
 */
export function readAllPhoto (photoArr) {
  // 判断是否有没加载的id
  const loadedPhotoArr = SessionTool.getCloudAssessmentPhotoId()
  const allLoad = loadedPhotoArr && photoArr.every(photoItem => loadedPhotoArr.includes(photoItem.photo_id)) || false
  // 没有全部加载完成 加载未加载图片
  if (!allLoad) {
    const notLoadedPhoto = loadedPhotoArr && photoArr.filter(photoItem => !loadedPhotoArr.includes(photoItem.photo_id)) || photoArr
    const promises = []
    notLoadedPhoto.forEach(item => {
      promises.push(loadPhoto(item.path))
    })
    Promise.all(promises)
      .then(() => {
        SessionTool.setCloudAssessmentPhotoId([...photoArr])
      })
  }
}

/**
 * @description 预加载图片
 * @param {*} path
 */
export function loadPhoto (path) {
  const imgDomain = store.getters.imgDomain
  const image = new Image()
  image.src = imgDomain + path
  return new Promise((resolve, reject) => {
    image.onload = () => { resolve() }
    image.onerror = () => { resolve() }
  })
}

/**
 * @description 获取图片md5值
 * @param {*} file
 */
export function getImgBufferPhoto (file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = function (evt) {
      const imgBuffer = Buffer.from(evt.target.result)
      resolve(md5(imgBuffer))
    }
    reader.onerror = function (error) {
      reject(error)
    }
    reader.readAsArrayBuffer(file)
  })
}
