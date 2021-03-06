/* eslint-disable no-console */
// 创建版本，版本编号和hash值
const fs = require('fs')
const md5File = require('md5-file')
const NodeRSA = require('node-rsa')

const file = './dist_electron/dist_vue.asar'

const args = process.argv
args.splice(0, 2)
const [mode] = args

const asarUrlDomain = mode === 'production' ? 'https://cloud.hzmantu.com' : 'https://fed.dev.hzmantu.com'
const folderPath = process.env.ROOTPATH

const config = {
  asarUrl: `${asarUrlDomain}/${folderPath}app_${process.env.CI_COMMIT_SHA}.asar`,
  asarMD5: "",
  version: process.env.CI_COMMIT_SHA,
  launcherVersion: "v1.0",
  checkTime: 1000,
}

if (!fs.existsSync(file)) {
  console.log(`${file} not found!`)
  return
}

// 获取打包文件 md5值
console.log('开始读取文件')
config.asarMD5 = md5File.sync(file)
console.log(config.asarMD5)

const writeObj = JSON.stringify(config)
const key = new NodeRSA()
console.log(writeObj)

key.importKey(process.env.SIGN_KEY, 'pkcs8-private-pem')
const keyCode = key.encryptPrivate(new Buffer(writeObj), 'base64', 'base64')
console.log(keyCode)

// 创建version文件
const commitName = process.env.CI_COMMIT_REF_NAME
const jsonPath = `./dist_electron/version-${commitName}.json`
fs.writeFileSync(jsonPath, keyCode)

console.log(`${commitName} ${config.version} created!`)
