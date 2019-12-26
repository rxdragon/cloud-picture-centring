const express = require('express')
const fs = require('fs')
const path = require('path')
const request = require('request')
const exp = express()
const userDir = global.userDir
const imageCachePath = path.join(userDir, 'imageCache')
const uuidv4 = require('uuid/v4')

const cloudPhotoHost = process.env.VUE_APP_DOWN_DOMAIN || 'fed.dev.hzmantu.com/upload_dev/'

createImageCacheDir()

exp.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  res.header('Access-Control-Allow-Methods', '*')
  res.header('Content-Type', 'application/json;charset=utf-8')
  next()
})

exp.get('/image/*', (req, res, next) => {
  const imageName = path.basename(req.originalUrl)
  const imageLocalPath = path.join(imageCachePath, imageName)
  const imageOnlinePath = 'https://' + path.join(cloudPhotoHost, imageName)
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
      // TODO 改文件名文件名
      fs.rename(temporarySavePath, imageLocalPath, async (err) => {
        if (err) { console.error(err) }
      })
    })
    .on('error', () => {
      // TODO 删除错误文件
      fs.unlinkSync(temporarySavePath)
    })
  httpStream.pipe(writeStream)
  httpStream.pipe(res)
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
