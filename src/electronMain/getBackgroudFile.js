const fs = require('fs')
const request = require('request')
const uuidv4 = require('uuid/v4')
const path = require('path')
const backgroundMap = require('../assets/config/BackgroundMap')
const userDir = global.userDir
const backgroundFolder = path.join(userDir, 'background_photo')

const BackGroundDomain = 'https://cloud.cdn-qn.hzmantu.com/background_photo/'
const compressExt = '_compress.png'

export async function checkBackGroundMapJson () {
  createImageCacheDir()
  
  const backgroundMapList = backgroundMap.default.map(item => {
    return {
      localOrginName: item.url.replace(BackGroundDomain, ''),
      localCompressName: `${item.md5}${compressExt}`,
      onlineOrginUrl: item.url,
      onlineCompressUrl: `${BackGroundDomain}${item.md5}${compressExt}`
    }
  })
  
  for (const backgroudItem of backgroundMapList) {
    // 检查缩略图
    const localCompressPath = path.join(backgroundFolder, backgroudItem.localCompressName)

    if (!hasBackgroundCache(localCompressPath)) {
      await downImage(backgroudItem.onlineCompressUrl, backgroudItem.localCompressName)
    }

    // 检查原图
    const localOrginPath = path.join(backgroundFolder, backgroudItem.localOrginName)
    if (!hasBackgroundCache(localOrginPath)) {
      await downImage(backgroudItem.onlineOrginUrl, backgroudItem.localOrginName)
    }
  }
}

async function downImage (url, imageName) {
  return new Promise((resolve, reject) => {
    const uuid = uuidv4()
    const temporarySaveName = uuid + '.download'
    const temporarySavePath = path.join(backgroundFolder, temporarySaveName)
    const fileLocalPath = path.join(backgroundFolder, imageName)

    const writeStream = fs.createWriteStream(temporarySavePath)
    const httpStream = request(url)
    httpStream
      .on('end', () => {
        if (hasBackgroundCache(fileLocalPath)) {
          fs.unlinkSync(temporarySavePath)
          resolve()
        } else {
          fs.rename(temporarySavePath, fileLocalPath, async (err) => {
            if (err) {
              fs.unlinkSync(temporarySavePath)
            }
            resolve()
          })
        }
      })
      .on('error', () => {
        fs.unlinkSync(temporarySavePath)
        resolve()
      })
    httpStream.pipe(writeStream)
  })
}

function hasBackgroundCache (filePath) {
  return fs.existsSync(filePath)
}

/**
 * @description 创建图片缓存文件夹
 */
function createImageCacheDir () {
  const hasImageCacheDir = fs.existsSync(backgroundFolder)
  if (hasImageCacheDir) return
  if (!userDir) return
  fs.mkdir(backgroundFolder, { recursive: true }, (err) => {
    if (err) throw err
  })
}
