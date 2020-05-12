/* eslint-disable no-console */
const express = require('express')
const fs = require('fs')
const path = require('path')
const request = require('request')
const exp = express()
const userDir = global.userDir
const imageCachePath = path.join(userDir, 'imageCache')
const uuidv4 = require('uuid/v4')

const MaxFileCount = 10
const clearCacheTime = 60 * 60 * 1000
const isProduction = !global.config('microApi')
console.log(global)
console.log(global.isDevelopment)
const cloudPhotoHost = isProduction ? 'cloud.cdn-qn.hzmantu.com/upload/' : 'cloud-dev.cdn-qn.hzmantu.com/upload_dev/'
console.log(cloudPhotoHost)
createImageCacheDir()
clearCache()

setInterval(() => {
  clearCache()
}, clearCacheTime)

exp.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  res.header('Access-Control-Allow-Methods', '*')
  res.header('Content-Type', 'application/json;charset=utf-8')
  next()
})

exp.get('/image/*', (req, res, next) => {
  const imageName = path.basename(req.originalUrl)
  const onlineImageUrl = req.originalUrl.replace('/image/', '') // 网络请求地址
  const imageLocalPath = path.join(imageCachePath, imageName) // 本地
  const imageOnlinePath = 'https://' + path.join(cloudPhotoHost, onlineImageUrl)
  // 是否有本地图片
  if (!hasImageCache(imageLocalPath)) {
    downloadFile(imageOnlinePath, imageName, res)
  } else {
    res.download(imageLocalPath)
  }
})

/**
 * @description 流式写入照片
 * @param {*} url
 * @param {*} savePath
 * @param {*} callback
 */
function downloadFile (url, imageName, res) {
  const uuid = uuidv4()
  const temporarySaveName = uuid + '.download'
  const temporarySavePath = path.join(imageCachePath, temporarySaveName)
  const imageLocalPath = path.join(imageCachePath, imageName)
  const writeStream = fs.createWriteStream(temporarySavePath)
  const httpStream = request(url)
  httpStream
    .on('end', () => {
      if (hasImageCache(imageLocalPath)) {
        fs.unlinkSync(temporarySavePath)
      } else {
        fs.rename(temporarySavePath, imageLocalPath, async (err) => {
          if (err) throw err
        })
      }
    })
    .on('error', () => {
      fs.unlinkSync(temporarySavePath)
    })
  httpStream.pipe(writeStream)
  httpStream.pipe(res)
}

function clearCache () {
  fs.readdir(imageCachePath, (err, data) => {
    if (err) throw err
    const fileLength = data.length
    if (fileLength > MaxFileCount) {
      data.sort((a, b) => {
        const filePatha = path.join(imageCachePath, a)
        const filePathb = path.join(imageCachePath, b)
        const fileStatCreateTimea = fs.statSync(filePatha).ctimeMs
        const fileStatCreateTimeb = fs.statSync(filePathb).ctimeMs
        return fileStatCreateTimeb - fileStatCreateTimea
      })
      const willDeleteFile = data.slice(MaxFileCount / 2)
      willDeleteFile.forEach(fileName => {
        const deleteFilePath = path.join(imageCachePath, fileName)
        fs.unlinkSync(deleteFilePath)
      })
    }
  })
}

/**
 * @description 创建图片缓存文件夹
 */
function createImageCacheDir () {
  const hasImageCacheDir = fs.existsSync(imageCachePath)
  if (hasImageCacheDir) return
  if (!userDir) return
  fs.mkdir(imageCachePath, { recursive: true }, (err) => {
    if (err) throw err
  })
}

function hasImageCache (imagePath) {
  return fs.existsSync(imagePath)
}

exp.listen(3000, () => {
  console.log('link contont')
})
