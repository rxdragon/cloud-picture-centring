import {
  PhotoEnum,
  NoReturnPhotoEnum,
  ReturnOnePhotoEnum,
  StoreReturnPhoto,
  prioritySequence,
  PHOTO_VERSION,
  CNLevelToType
} from '@/utils/enumerate.js'

import * as SessionTool from '@/utils/sessionTool.js'
import * as mPath from '@/utils/selfPath.js'

import store from '@/store' // vuex
import QiNiuETag from '@/utils/qetag.js'

/**
 * @description 截取文件名
 * @param {*} name
 */
export function fileNameFormat (name) {
  const fileName = realName(name)
  const indexPoint = fileName.lastIndexOf('.')
  const returnName = fileName
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
  const prodFilePath = 'upload/'
  // 开发环境存储目录
  const devFilePath = 'upload_dev/'
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
  let createData = []
  const PhotoEnums = reworkTimes < 2 ? [...PhotoEnumArr[reworkTimes]] : [...PhotoEnumArr[2]]
  if (storeReturn) {
    const findCompeteIndex = PhotoEnums.findIndex(item => item === 'complete_photo')
    if (findCompeteIndex) {
      PhotoEnums.splice(findCompeteIndex + 1, 0, ...StoreReturnPhoto)
    }
  }
  for (const version of PhotoEnums) {
    const findFinishPhoto = photoArr.find(photoItem => photoItem.version === 'finish_photo')
    if (version === 'last_retouch_photo' && !findFinishPhoto) break
    if (version === 'store_rework' && !findFinishPhoto) break
    if (version === 'complete_photo') {
      const findVersionPhotos = photoArr.filter(photoItem => photoItem.version === version)
      if (findVersionPhotos) {
        createData = [...createData, ...findVersionPhotos]
      }
    } else {
      const findVersionPhoto = photoArr.find(photoItem => photoItem.version === version)
      if (findVersionPhoto) {
        createData.push(findVersionPhoto)
      }
    }
  }
  return createData
}

/**
 * @description 过滤照片版本
 * @param photoVersion
 */
export function settlePhotoVersion (oldPhotoVersion) {
  oldPhotoVersion = oldPhotoVersion.filter(item => item)
  let idList = oldPhotoVersion.map(item => _.get(item, 'id') || '')
  idList = [...new Set(idList)]
  const idListMap = {}
  idList.forEach(idItem => {
    idListMap[idItem] = true
  })
  const photoVersion = []

  oldPhotoVersion.forEach(item => {
    if (idListMap[item.id]) {
      photoVersion.push(item)
      delete idListMap[item.id]
    }
  })


  const photoVersionArr = [
    PHOTO_VERSION.ORIGINAL_PHOTO,
    PHOTO_VERSION.FIRST_PHOTO,
    PHOTO_VERSION.COMPLETE_PHOTO,
    PHOTO_VERSION.STORE_REWORK,
    PHOTO_VERSION.FINISH_PHOTO
  ]
  const timeLine = photoVersion.sort((a, b) => {
    return Number(a.id) - Number(b.id)
  })
  const createData = []
  let storeReturnCount = 0
  timeLine.forEach(versionItem => {
    if (photoVersionArr.includes(versionItem.version)) {
      if (versionItem.version === PHOTO_VERSION.STORE_REWORK) {
        storeReturnCount++
        versionItem.storeReturnCount = storeReturnCount
      }
      createData.push(versionItem)
      const findVersionIndex = versionItem.version === PHOTO_VERSION.LAST_RETOUCH_PHOTO
        ? photoVersionArr.findIndex(item => item === PHOTO_VERSION.COMPLETE_PHOTO)
        : photoVersionArr.findIndex(item => item === versionItem.version)
      if (findVersionIndex > -1 && versionItem.version !== PHOTO_VERSION.STORE_REWORK) {
        photoVersionArr.splice(findVersionIndex, 1)
      }
    }
  })
  return createData
}

/**
 * @description 处理comitInfo数据
 * @param {*} commitInfo 评价图片
 * @param {*} issueLabel 评价标签
 */
export function handleCommitInfo (commitInfo, issueLabel) {
  const parentData = []
  issueLabel.forEach(issueItem => {
    // TODO 云学院tag
    const className = 'TODO'
    const gradeName = _.get(issueItem, 'parent.name') || '异常'
    const createData = {
      id: issueItem.id,
      name: `${className}-${gradeName}-${issueItem.name}`,
      type: CNLevelToType[issueItem.name]
    }
    parentData.push(createData)
  })
  this.checkPoolTags = parentData
  return {
    ...commitInfo,
    issueLabel: parentData
  }
}

/**
 * @description 查询最后一次门店退回
 * @param {*} photoVersion 
 */
export function findLastReturnPhoto (photoVersion) {
  const timeLine = photoVersion.sort((a, b) => {
    return Number(b.id) - Number(a.id)
  })
  const findReturnShowPhoto = timeLine.find(versionItem => versionItem.version === 'store_rework')
  return findReturnShowPhoto
}

/**
 * @description 查找指定version版本
 * @param {Array} filtePhotoVersion 
 * @param {Array} needVersion 
 */
export function filtePhotoVersion (filtePhotoVersion, needVersion) {
  const createData = {}
  needVersion.forEach(versionItem => {
    const findVersion = filtePhotoVersion.find(verPhotoItem => verPhotoItem.version === versionItem)
    if (findVersion) {
      createData[versionItem] = {
        path: findVersion.path
      }
    }
  })
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
  const allLoad = (loadedPhotoArr && cachePhotoArr.every(photoItem => loadedPhotoArr.includes(photoItem.id))) || false
  // 没有全部加载完成 加载未加载图片
  if (!allLoad) {
    let notLoadCachePhotoArr = null
    if (loadedPhotoArr) {
      notLoadCachePhotoArr = cachePhotoArr.filter(photoItem => !loadedPhotoArr.includes(photoItem.id))
    }
    const notLoadedPhoto = notLoadCachePhotoArr || cachePhotoArr
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
    image.onload = () => {
      resolve()
    }
    image.onerror = () => {
      resolve()
    }
  })
}

/**
 * @description 获取图片md5值
 * @param {*} file
 */
export async function getImgBufferPhoto (file) {
  const reader = new QiNiuETag()
  await reader.updateBlob(file)
  const data = reader.fileInfo
  if (file.path) {
    const fileExt = mPath.getExtName(file.path).toLowerCase()
    const originalExt = data.typeInfo.ext.toLowerCase()
    if (fileExt !== `.${originalExt}`) {
      const errorMessage = `
        <span class="danger-color">${file.name}</span>格式错误，
        文件原始格式为<span class="danger-color">${originalExt}</span>格式，
        请使用<span class="danger-color">PS另存为</span>保存!`
      throw new Error(errorMessage)
    }
  }
  return data
}

/**
 * @description 获取图片md5值
 * @param {*} file
 */
export async function getImgBufferPhotoNotCheck (file) {
  const reader = new QiNiuETag()
  await reader.updateBlob(file)
  const data = reader.fileInfo
  return data
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

/**
 * @description 文件后缀名转小写
 */
export function photoPathExtToLowerCase (path) {
  const filePath = realName(path)
  const ext = getFilePostfix(filePath).toLowerCase()
  const name = fileNameFormat(filePath)
  return `${name}${ext}`
}

/**
 * @description 过滤文件夹位置
 * @param {*} path 
 */
export function realName (path) {
  const pathArr = path.split('/')
  return pathArr[pathArr.length - 1]
}

/**
 * @description 过滤自动修图后缀
 * @param {*} params 
 */
export function fixAutoPhotoName (path) {
  for (const mode of prioritySequence) {
    const replaceMode = `~${mode}`
    path = path.replace(replaceMode, '')
  }
  return path
}
