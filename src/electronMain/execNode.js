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
    execute(`ps -A -o ppid,%cpu,%mem,vsz,rss,command | grep Photoshop | awk '{ print $1, $2, $3, $4, $5, $6 }'`, (error, stdout, stderr) => {
      if (error) {
        win.webContents.send('get-photoshop-memory:res', { error })
        return
      }
      win.webContents.send('get-photoshop-memory:res', { stdout })
    })
  }
  function getAllMemory () {
    execute(`ps -A -o ppid,%cpu,%mem,vsz,rss,command | awk '{ print $1, $2, $3, $4, $5, $6 }'`, (error, stdout, stderr) => {
      if (error) {
        win.webContents.send('get-all-memory:res', { error })
        return
      }
      win.webContents.send('get-all-memory:res', { stdout })
    })
  }
  ipcMain.on('get-all-memory', getAllMemory)
  ipcMain.on('get-photoshop-memory', getPSMemory)
  ipcMain.on('find-photoshop', findPhotoShop)
}

export default initExecIncident
