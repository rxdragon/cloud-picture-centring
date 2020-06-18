const exec = require('child_process').exec

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

function initExecIncident (win, ipcMain) {
  // 查找ps
  function findPhotoShop () {
    execute('system_profiler -xml SPApplicationsDataType', (error, stdout, stderr) => {
      if (error) {
        win.webContents.send('find-photoshop:res', { error })
        return
      }
      win.webContents.send('find-photoshop:res', { stdout })
    })
  }
  // 获取PS内存
  function getPSMemory () {
    execute("ps -A -o ppid,command | grep Photoshop | awk '{ print $1 }'", (error, stdout, stderr) => {
      if (error) {
        win.webContents.send('get-photoshop-memory:res', { error })
        return
      }
      const ppids = stdout
      const ppidArr = ppids.split('\n')
      const d = {}
      ppidArr.forEach(k => {
        !d[k] ? d[k] = 1 : d[k]++
      })
      const mainPid = Object.keys(d).sort((a, b) => d[b] - d[a])[0]
      execute(`ps Au -o %cpu,%mem,ppid | grep ${mainPid} | awk '{ print $2, $3, $4, $5, $6, $14 }'`, (error, stdout, stderr) => {
        if (error) {
          win.webContents.send('get-photoshop-memory:res', { error })
          return
        }
        win.webContents.send('get-photoshop-memory:res', { stdout })
      })
    })
  }
  ipcMain.on('get-photoshop-memory', getPSMemory)
  ipcMain.on('find-photoshop', findPhotoShop)
}

export default initExecIncident
