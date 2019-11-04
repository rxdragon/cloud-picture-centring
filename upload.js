const fs = require('fs')
const path = require('path')
const upyun = require('upyun')
const args = process.argv
args.splice(0, 2)
// 得到配置
const { OPERATOR, PASSWORD, BUCKET, ROOTPATH, SOURCEFOLDER } = process.env
console.log(ROOTPATH)
const sourcefolder = path.resolve(__dirname, SOURCEFOLDER)
// 利用upyun包准备上传工具
const service = new upyun.Service(BUCKET, OPERATOR, PASSWORD)
const client = new upyun.Client(service)
// 要上传的文件列表
const fileList = []

// 上传文件脚本
async function uploadFileList (fileList, client) {
  for (const item of fileList) {
    let file = null
    let remoteFile = null
    try {
      // 比对文件大小进行上传
      remoteFile = await client.headFile(item.remotePath)
      const isVersionJson = item.name === 'version.json'
      if (!isVersionJson && remoteFile && remoteFile.size === item.size && !/index.html$/.test(item.remotePath)) {
        console.log('\x1b[33m' + item.filePath + '\t不需要上传\x1b[0m')
      } else {
        file = fs.readFileSync(item.filePath)
        await client.putFile(item.remotePath, file)
        console.log('\x1b[32m' + item.filePath + '\t上传成功\x1b[0m')
      }
    } catch (err) {
      console.log('\x1b[35m' + item.filePath + '\t上传失败\x1b[0m')
      console.log(err)
      process.exit(1)
    }
  }
}
// 读出所有的文件
function findAllFile (uploadDir, relativePath) {
  const dirExist = fs.existsSync(uploadDir)
  if (dirExist) {
    const res = fs.readdirSync(uploadDir)
    if (res.length === 0) {
      return
    }
    for (const item of res) {
      if (fs.statSync(uploadDir + path.sep + item).isDirectory()) {
        findAllFile(uploadDir + path.sep + item, relativePath + item + path.sep)
      } else {
        const localPath = uploadDir + path.sep + item
        console.log(item)
        fileList.push({
          filePath: localPath,
          name: item,
          remotePath: relativePath + item,
          size: fs.statSync(localPath).size
        })
      }
    }
  }
}

findAllFile(sourcefolder, ROOTPATH)
if (fileList.length === 0) {
  console.log('\x1b[31m没有要上传的资源\x1b[0m')
} else {
  uploadFileList(fileList, client)
}
