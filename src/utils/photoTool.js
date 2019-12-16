import { PhotoEnum, NoReturnPhotoEnum, ReturnOnePhotoEnum, StoreReturnPhoto } from '@/utils/enumerate.js'
import md5 from 'md5'
import store from '@/store' // vuex
import * as SessionTool from '@/utils/sessionTool.js'
const fileType = require('file-type')

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
export function settlePhoto (photoArr, reworkTimes = 0, storeReturn = false) {
  const PhotoEnumArr = [NoReturnPhotoEnum, ReturnOnePhotoEnum, PhotoEnum]
  const createData = []
  const PhotoEnums = reworkTimes < 2 ? [...PhotoEnumArr[reworkTimes]] : [...PhotoEnumArr[2]]
  if (storeReturn) {
    const findCompeteIndex = PhotoEnums.findIndex(item => item === 'complete_photo')
    if (findCompeteIndex) {
      PhotoEnums.splice(findCompeteIndex + 1, 0, ...StoreReturnPhoto)
    }
  }
  for (const version of PhotoEnums) {
    const findVersionPhoto = photoArr.find(photoItem => photoItem.version === version)
    if (findVersionPhoto) { createData.push(findVersionPhoto) }
  }
  return createData
}

/**
 * @description 是否预加载完成图片
 * @param {*} photoArr
 */
export function readAllPhoto (photoArr) {
  const cachePhotoArr = JSON.parse(JSON.stringify(photoArr))
  const cacheCount = 10
  // 判断是否有没加载的id
  cachePhotoArr.length = cacheCount > cachePhotoArr.length ? cachePhotoArr.length : cacheCount
  const loadedPhotoArr = SessionTool.getCloudAssessmentPhotoId()
  const allLoad = loadedPhotoArr && cachePhotoArr.every(photoItem => loadedPhotoArr.includes(photoItem.id)) || false
  // 没有全部加载完成 加载未加载图片
  if (!allLoad) {
    const notLoadedPhoto = loadedPhotoArr && cachePhotoArr.filter(photoItem => !loadedPhotoArr.includes(photoItem.id)) || cachePhotoArr
    const promises = []
    notLoadedPhoto.forEach(item => {
      promises.push(loadPhoto(item.path))
    })
    Promise.all(promises)
      .then(() => {
        SessionTool.setCloudAssessmentPhotoId([...cachePhotoArr])
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
      const uploadPhotoMd5 = md5(imgBuffer)
      const type = fileType(imgBuffer).mime
      resolve({ uploadPhotoMd5, type })
    }
    reader.onerror = function (error) {
      reject(error)
    }
    reader.readAsArrayBuffer(file)
  })
}

/**
 * @description 获取人数列表
 * @param {*} photos
 */
export function getPhotoPeopleTabel (photos) {
  const createData = []
  photos.forEach(photoItem => {
    const findSamePeople = createData.find(item => item.peopleLabel === photoItem.people_num)
    if (findSamePeople) {
      findSamePeople.photoNum++
    } else {
      createData.push({
        peopleLabel: photoItem.people_num,
        photoNum: 1
      })
    }
  })
  createData.sort((a, b) => a.peopleLabel - b.peopleLabel)
  if (createData[0].peopleLabel === 0) {
    createData[0].peopleLabel = '不计收入'
    const moveData = createData.shift()
    createData.push(moveData)
  }
  return createData
}

/**
 * @description 重命名
 * @param {*} name
 */
export function renameFirstPhoto (filePath) {
  const ext = getFilePostfix(filePath)
  const name = fileNameFormat(filePath)
  return `${name}_ps${ext}`
}
