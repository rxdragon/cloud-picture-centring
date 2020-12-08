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

  // 查看解析信息
  function nslookupBySelf (event) {
    execute('nslookup cloud.cdn-qn.hzmantu.com', (error, stdout, stderr) => {
      if (error) {
        event.returnValue = 'error'
        return
      }
      event.returnValue = stdout
    })
  }

  // 查看电信dns 解析信息
  function nslookupByTelecom (event) {
    execute('nslookup cloud.cdn-qn.hzmantu.com 10.0.0.1', (error, stdout, stderr) => {
      if (error) {
        event.returnValue = 'error'
        return
      }
      event.returnValue = stdout
    })
  }

  // 查看dig 信息
  function digAdmin (event) {
    execute('dig cloud.cdn-qn.hzmantu.com', (error, stdout, stderr) => {
      if (error) {
        event.returnValue = 'error'
        return
      }
      event.returnValue = stdout
    })
  }

  // curl 图片信息
  function curlImageInfo (event, imageUrl) {
    // eslint-disable-next-line max-len
    execute(`curl -o /dev/null -s -w %{time_connect}:%{time_starttransfer}:%{time_total}:%{time_namelookup}:%{speed_download} ${imageUrl}  -v`, (error, stdout, stderr) => {
      if (error) {
        event.returnValue = 'error'
        return
      }
      event.returnValue = stderr + '\n' + stdout
    })
  }


  ipcMain.on('find-photoshop', findPhotoShop)
  ipcMain.on('network-nslookup', nslookupBySelf)
  ipcMain.on('network-nslookup-telecom', nslookupByTelecom)
  ipcMain.on('network-dig', digAdmin)
  ipcMain.on('network-curl-imageInfo', curlImageInfo)
}

export default initExecIncident
