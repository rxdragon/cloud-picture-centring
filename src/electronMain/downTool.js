import DownloadManager from './DownloadManager'
// 下载器 注册保存地址
const downloadFolder = ''
DownloadManager.register({ downloadFolder })

/**
 * 初始化下载管理器
 *
 * @param win
 * @param ipcMain
 */
function initDownloadManager (win, ipcMain) {
  // 仅保存正在下载的信息
  const downingInfo = {}

  /**
   * @description 接收到下载命令
   * @param event
   * @param uuid
   * @param downloadConfig
   */
  function onNeedDownload (event, { uuid, downloadConfig }) {
    downloadConfig = Object.assign(downloadConfig, {
      onProgress: (progress, downInfo, item) => {
        if (!(uuid in downingInfo)) downingInfo[uuid] = item
        win.webContents.send('download-manage:process', {
          uuid,
          progress,
          downInfo,
          status: item.getState(), // 状态
          canResume: item.canResume()
        })
      }
    })
    DownloadManager.download(downloadConfig, (error, finished, errors) => {
      if (error) {
        console.log(error)
        win.webContents.send('download-manage:error', { uuid, errors })
        return
      }
      if (uuid in downingInfo) {
        delete downingInfo[uuid]
        win.webContents.send('download-manage:success', { uuid })
      }
    })
    event.returnValue = 'success'
  }

  /**
   * @description 接收到暂停命令
   * @param event
   * @param uuid
   */
  function onNeedPause (event, { uuid }) {
    const downloadItem = downingInfo[uuid]

    if (!downloadItem) {
      event.returnValue = 'fail'
      return
    }
    if (!downloadItem.isPaused()) downloadItem.pause()
    event.returnValue = 'success'
  }

  /**
   * @description 接收到恢复命令
   * @param event
   * @param uuid
   */
  function onNeedResume (event, { uuid }) {
    const downloadItem = downingInfo[uuid]

    if (!downloadItem || !downloadItem.canResume()) {
      event.returnValue = 'fail'
      return
    }
    if (downloadItem.isPaused()) downloadItem.resume()
    event.returnValue = 'success'
  }

  /**
   * @description 接收到恢复命令
   * @param event
   * @param uuid
   */
  function onNeedDelete (event, { uuid }) {
    try {
      const downloadItem = downingInfo[uuid]
      if (downloadItem) {
        delete downingInfo[uuid]
      }
      event.returnValue = 'success'
    } catch (error) {
      event.returnValue = 'fail'
    }
  }

  /**
   * @description 接收到取消命令
   * @param event
   * @param uuid
   */
  function onNeedCancel (event, { uuid }) {
    const downloadItem = downingInfo[uuid]

    if (!downloadItem) {
      event.returnValue = 'fail'
      return
    }

    downloadItem.cancel()
    delete downingInfo[uuid]
    event.returnValue = 'success'
  }

  ipcMain.on('download-manage:downloadFile', onNeedDownload)
  ipcMain.on('download-manage:pause', onNeedPause)
  ipcMain.on('download-manage:resume', onNeedResume)
  ipcMain.on('download-manage:delete', onNeedDelete)
  ipcMain.on('download-manage:cancel', onNeedCancel)
}

export default initDownloadManager

