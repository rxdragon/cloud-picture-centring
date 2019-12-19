// 注册diglog事件
function initUtils (win, ipcMain) {
  // 选择文件
  function selectFile (event, { filePath }) {
    const wc = win.webContents
    try {
      wc.debugger.attach('1.1')
    } catch (err) {
      console.log('Debugger attach failed : ', err)
    }
    wc.debugger.sendCommand('DOM.getDocument', {}, (err, res) => {
      console.error(err)
      wc.debugger.sendCommand('DOM.querySelector', {
        nodeId: res.root.nodeId,
        selector: '#el-upload-file .el-upload__input'
      }, (err, res) => {
        console.error(err)
        wc.debugger.sendCommand('DOM.setFileInputFiles', {
          nodeId: res.nodeId,
          files: filePath // Actual list of paths
        }, () => {
          wc.debugger.detach()
        })
      })
    })
  }

  ipcMain.on('select-file', selectFile)
}

export default initUtils
