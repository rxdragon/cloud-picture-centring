const { dialog } = require('electron')

// 注册diglog事件
function initDialog (win, ipcMain) {
  // 显示保存弹框
  function showSavePathDiaLog (event) {
    const options = {
      title: '选择保存路径',
      defaultPath: '',
      buttonLabel: '确认',
      properties: ['openDirectory', 'createDirectory', 'promptToCreate']
    }
    const request = dialog.showOpenDialogSync(options)
    if (request) {
      event.returnValue = request
    } else {
      event.returnValue = ''
    }
  }

  ipcMain.on('change-savePath', showSavePathDiaLog)
}

export default initDialog
