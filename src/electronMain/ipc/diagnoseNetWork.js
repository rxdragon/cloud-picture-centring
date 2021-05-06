import originalFs from "original-fs"
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
  exec(command, { timeout: 5000 }, function (error, stdout, stderr) {
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
    const execDirective = 'ping -c3 api-gateway.hzmantu.com'
    execute(execDirective, (error, stdout, stderr) => {
      if (error) {
        resolve(`${execDirective}\n${error}`)
      }
      resolve(`### ${execDirective} ###\n${stdout}`)
    })
  })
}

async function getNetworkInfo () {
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
  createData = `ip address: ${myIp} \n\n ${global.nslookupMantu} \n\n ${createData}`
  return createData
}

function initDiagnoseNetWork (win, ipcMain) {
  // 检测网络信息
  async function diagnose (event, config) {
    try {
      
      const disconnectTime = new Date()
      let info = await getNetworkInfo()
      info = `${disconnectTime} \n\n ${info}`
      // 写入文件
      const time = new Date().getTime()
      const name = config.name || '-'

      const logName = `${time}-${name}.json`
      const jsonPath = path.join(networkLogPath, logName)
      
      originalFs.writeFileSync(jsonPath, info)

      try {
        await uploadNetworkLog()
      } catch (error) {
        console.warn(`上传失败：${error}`)
      }

      event.returnValue = info
    } catch (error) {
      event.returnValue = error
      return
    }
  }

  // 调试云端消息
  async function cloudtoolDiagnose (event) {
    try {
      const info = await getNetworkInfo()
      const nowDate = new Date()
      const res = `${nowDate} \n\n ${info}`
      win.webContents.send('get-network-info', res)
      event.returnValue = res
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

  // nslookup api地址
  function nslookupMainto (event) {
    const execDirective = 'nslookup api-gateway.hzmantu.com'
    execute(execDirective, (error, stdout, stderr) => {
      if (error) {
        global.nslookupMantu = `${execDirective}\n${error}`
      }
      global.nslookupMantu = `### ${execDirective} ###\n${stdout}`
    })
  }

  function cloudtoolExce (event, exce) {
    execute(exce, (error, stdout, stderr) => {
      const nowDate = new Date()
      if (error || stderr) {
        let errorMessage = error
        try {
          errorMessage = `${String(error)}\n\n${JSON.stringify(error)}`
        } catch {
          errorMessage = error
        }
        const res = `${nowDate} \n\n ${errorMessage} \n\n stderr ${stderr}`
        win.webContents.send('get-network-info', res)
        event.returnValue = res
        return
      }
      
      const res = `${nowDate} \n\n ${stdout}`
      win.webContents.send('get-network-info', res)
      event.returnValue = res
      return
    })
  }

  ipcMain.on('network-cloudtool', cloudtoolDiagnose)
  ipcMain.on('network-diagnose', diagnose)
  ipcMain.on('network-uploadLog', uploadLog)
  ipcMain.on('network-nslookup-mainto', nslookupMainto)
  ipcMain.on('network-cloudtool-exce', cloudtoolExce)
}

createNetworkDir()
export default initDiagnoseNetWork
