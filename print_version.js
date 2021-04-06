/* eslint-disable no-console */
// 创建版本，版本编号和hash值
const fs = require('fs')
const md5 = require('md5')
const NodeRSA = require('node-rsa')

const file = './dist_electron/dist_vue.asar'

const args = process.argv
args.splice(0, 2)
const [mode] = args

const asarUrlDomain = mode === 'production' ? 'https://showpic.mainto.cn' : 'https://fed.dev.hzmantu.com'
const folderPath = process.env.ROOTPATH

const config = {
  asarUrl: `${asarUrlDomain}${folderPath}app_${process.env.CI_COMMIT_SHA}.asar`,
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
const fileBuf = fs.readFileSync(file)
config.asarMD5 = md5(fileBuf)

const writeObj = JSON.stringify(config)
const key = new NodeRSA()

key.importKey(process.env.SIGN_KEY, 'pkcs8-private-pem')
// 创建version文件
fs.writeFileSync('./dist_electron/version.json', key.encryptPrivate(new Buffer(writeObj), 'base64', 'base64'))

console.log(`${config.version} created!`)
