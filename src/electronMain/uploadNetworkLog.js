const path = require('path')
import * as originalFs from 'original-fs'
import upyun from 'upyun'

const OPERATOR = 'dev'
const PASSWORD = 'maintodev'
const BUCKET = 'img-mainto-dev'
const ROOTPATH = 'cloud-picture-centring-netlog/'

const userDir = global.userDir
const networkLogPath = path.join(userDir, 'networkLog')


// 读出所有的文件
function findAllFile (uploadDir, relativePath) {
  console.warn('读取文件')
  const fileList = []
  const dirExist = originalFs.existsSync(uploadDir)
  if (dirExist) {
    const res = originalFs.readdirSync(uploadDir)
    if (res.length === 0) {
      console.warn('没有读取到文件')
      return
    }
    for (const item of res) {
      if (originalFs.statSync(uploadDir + path.sep + item).isDirectory()) {
        findAllFile(uploadDir + path.sep + item, relativePath + item + path.sep)
      } else {
        const localPath = uploadDir + path.sep + item
        fileList.push({
          filePath: localPath,
          name: item,
          remotePath: relativePath + item,
          size: originalFs.statSync(localPath).size
        })
      }
    }
  }
  return fileList
}

// 上传文件脚本
async function uploadFileList (fileList, client) {
  for (const item of fileList) {
    let file = null
    try {
      await client.headFile(item.remotePath)
      file = originalFs.readFileSync(item.filePath)
      await client.putFile(item.remotePath, file)
      originalFs.unlinkSync(item.filePath)
      console.warn('\x1b[32m' + item.filePath + '\t上传成功\x1b[0m')
    } catch (err) {
      console.warn('\x1b[35m' + item.filePath + '\t上传失败\x1b[0m')
    }
  }
}

/**
 * @description 上传文件
 * @param {*} params 
 */
export default async function uploadNetworkLog () {
  // 利用upyun包准备上传工具
  const service = new upyun.Service(BUCKET, OPERATOR, PASSWORD)
  const client = new upyun.Client(service)

  const fileList = findAllFile(networkLogPath, ROOTPATH)

  if (fileList.length === 0) {
    console.warn('\x1b[31m没有要上传的日志\x1b[0m')
  } else {
    console.warn(`读取到${fileList.length}个文件`)
    console.warn('开始上传')
    await uploadFileList(fileList, client)
  }
}
