import * as originalFs from 'original-fs'
const exec = require('child_process').exec
const path = require('path')
const ip = require('ip')

import uploadNetworkLog from '../uploadNetworkLog'

const userDir = global.userDir
const networkLogPath = path.join(userDir, 'networkLog')

/**
 * @description 执行node 命令
 * @param {*} command
 * @param {*} callback
 */
function execute (command, callback) {
  exec(command, function (error, stdout, stderr) {
    callback(error, stdout, stderr)
  })
}

/**
 * @description 创建日志文件夹
 */
function createNetworkDir () {
  const hasDir = originalFs.existsSync(networkLogPath)
  if (hasDir) return
  if (!userDir) return
  originalFs.mkdir(networkLogPath, { recursive: true }, (err) => {
    if (err) throw err
  })
}

// 查看解析信息
function tracerouteNet () {
  return new Promise((resolve, reject) => {
    const execDirective = 'traceroute -m3 api-gateway.hzmantu.com'
    execute(execDirective, (error, stdout, stderr) => {
      if (error) {
        resolve(`${execDirective}\n${error}`)
      }
      resolve(`### ${execDirective} ###\n${stdout}`)
    })
  })
}

// ping 百度
function pingBaidu (event) {
  return new Promise((resolve, reject) => {
    const execDirective = 'ping -c3 www.baidu.com'
    execute(execDirective, (error, stdout, stderr) => {
      if (error) {
        resolve(`${execDirective}\n${error}`)
      }
      resolve(`### ${execDirective} ###\n${stdout}`)
    })
  })
}

// ping QQ
function pingQQ (event) {
  return new Promise((resolve, reject) => {
    const execDirective = 'ping -c3 www.qq.com'
    execute(execDirective, (error, stdout, stderr) => {
      if (error) {
        resolve(`${execDirective}\n${error}`)
      }
      resolve(`### ${execDirective} ###\n${stdout}`)
    })
  })
}

// ping 线上地址
function pingMantu (event) {
  return new Promise((resolve, reject) => {
    const execDirective = 'ping -c3 api.dev.hzmantu.com'
    execute(execDirective, (error, stdout, stderr) => {
      if (error) {
        resolve(`${execDirective}\n${error}`)
      }
      resolve(`### ${execDirective} ###\n${stdout}`)
    })
  })
}

function initDiagnoseNetWork (win, ipcMain) {
  // 检测网络信息
  async function diagnose (event, config) {
    try {
      let data = []
      try {
        data = await Promise.all([
          pingBaidu(),
          pingQQ(),
          pingMantu(),
          tracerouteNet()
        ])
      } catch (error) {
        data = error
      }
      const myIp = ip.address()

      let createData = ''
      if (typeof data === 'string') {
        createData = data
      } else {
        createData = data.join('\n--------------------------------------------------------------------------\n')
      }
      createData = `ip address: ${myIp} \n\n ${createData}`

      // 写入文件
      const time = new Date().getTime()
      const name = config.name || '-'

      const logName = `${time}-${name}.json`
      const jsonPath = path.join(networkLogPath, logName)
      originalFs.writeFileSync(jsonPath, createData)

      try {
        await uploadNetworkLog()
      } catch (error) {
        console.warn(`上传失败：${error}`)
      }

      event.returnValue = createData
    } catch (error) {
      event.returnValue = error
      return
    }
  }

  // 上传日志文件
  async function uploadLog (event) {
    try {
      await uploadNetworkLog()
      event.returnValue = 'success'
    } catch (error) {
      event.returnValue = error
    }
  }

  ipcMain.on('network-diagnose', diagnose)
  ipcMain.on('network-uploadLog', uploadLog)
}

createNetworkDir()
export default initDiagnoseNetWork
