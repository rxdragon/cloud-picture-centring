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
  ipcMain.on('find-photoshop', findPhotoShop)
}

export default initExecIncident
