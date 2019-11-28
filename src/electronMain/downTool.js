import DownloadManager from './DownloadManager'

const { app } = require('electron')

DownloadManager.register({
  downloadFolder: app.getPath('desktop')
})

/**
 * 初始化下载管理器
 *
 * @param win
 * @param ipcMain
 */
function initDownloadManager (win, ipcMain) {
  /**
     * 仅保存正在下载的信息
     *
     * @type {{}}
     */
  const downingInfo = {}

  /**
     * 接收到下载命令
     *
     * @param event
     * @param uuid
     * @param downloadConfig
     */
  function onNeedDownload (event, { uuid, downloadConfig }) {
    downloadConfig = Object.assign(downloadConfig, {
      onProgress: (progress, item) => {
        if (!(uuid in downingInfo)) downingInfo[uuid] = item
        win.webContents.send('download-manage:process', {
          uuid,
          progress,
          canResume: item.canResume(),
          savePath: item.getSavePath() // 保存路径
        })
      }
    })

    DownloadManager.download(downloadConfig, function (error, finished, errors) {
      if (uuid in downingInfo) delete downingInfo[uuid]

      if (error) {
        win.webContents.send('download-manage:error', { uuid, errors })
        return
      }

      win.webContents.send('download-manage:success', { uuid })
    })
  }

  /**
   * 接收到暂停命令
   *
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
  }

  /**
     * 接收到恢复命令
     *
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
  }

  /**
     * 接收到取消命令
     *
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
    delete downloadItem[uuid]
  }

  ipcMain.on('download-manage:downloadFile', onNeedDownload)
  ipcMain.on('download-manage:pause', onNeedPause)
  ipcMain.on('download-manage:resume', onNeedResume)
  ipcMain.on('download-manage:cancel', onNeedCancel)
}

export default initDownloadManager
