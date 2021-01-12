const path = require('path')
const fs = require('fs')
const userDir = global.userDir
const imageCachePath = path.join(userDir, 'imageCache')
const { shell } = require('electron')

function hasImageCache (imagePath) {
  return fs.existsSync(imagePath)
}

// 注册选中文件事件
function initUtils (win, ipcMain) {
  // 选择文件
  function selectFile (event, { filePath }) {
    const wc = win.webContents
    try {
      wc.debugger.attach('1.1')
    } catch (err) {
      console.error('Debugger attach failed : ', err)
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

  // 打开文件夹
  function openFile (event) {
    try {
      if (!hasImageCache(imageCachePath)) throw new Error('no find fileFolder')
      shell.showItemInFolder(imageCachePath)
      event.returnValue = 'success'
    } catch (error) {
      event.returnValue = error.message
    }
  }

  /**
   * @description 清楚图片缓存
   */
  function cleanImageCache (event) {
    try {
      fs.readdir(imageCachePath, (err, data) => {
        if (err) throw err
        data.forEach(fileName => {
          const deleteFilePath = path.join(imageCachePath, fileName)
          fs.unlinkSync(deleteFilePath)
        })
      })
      event.returnValue = 'success'
    } catch (error) {
      event.returnValue = error.message
    }
  }

  function getImageCache (event) {
    try {
      fs.readdir(imageCachePath, (err, data) => {
        if (err) throw err
        event.returnValue = data.length
      })
    } catch (error) {
      event.returnValue = 'fail'
    }
  }

  // 获取路径地址
  function getUserDir (event) {
    event.returnValue = userDir
  }

  ipcMain.on('utils:OpenFile', openFile)
  ipcMain.on('utils:clean-image-cache', cleanImageCache)
  ipcMain.on('utils:get-image-cache', getImageCache)
  ipcMain.on('utils:get-userDir', getUserDir)
  ipcMain.on('select-file', selectFile)
}

export default initUtils
