const { session, app, ipcMain } = require('electron')
import path from 'path'
import fs from 'fs'

let newFoldName = ''

let downloadItems = []

// 监听将要下载事件
export function onWillDownload (win) {
  session.defaultSession.on('will-download', async (event, item) => {
    const fileName = item.getFilename() // 文件名
    const downloadPath = app.getPath('desktop') // 默认下载储存地址

    let fileNum = 0 // 文件名字
    let savePath = path.join(downloadPath, newFoldName, fileName) // 保存地址
    // savePath基础信息
    const ext = path.extname(savePath)
    const name = path.basename(savePath, ext)
    const dir = path.dirname(savePath)

    // 文件名自增逻辑
    while (fs.existsSync(savePath)) {
      fileNum += 1
      savePath = path.format({
        dir,
        ext,
        name: `${name}(${fileNum})`
      })
    }

    // 设置下载目录，阻止系统dialog的出现
    item.setSavePath(savePath)

    // 通知渲染进程，有一个新的下载任务
    const itemIndex = downloadItems.length
    downloadItems = [item, ...downloadItems]
    win.webContents.send('new-download-item', handleDownloadItem(item, itemIndex))

    // 下载任务更新
    item.on('updated', (e, state) => { // eslint-disable-line
      const receivedBytes = item.getReceivedBytes()
      const totalBytes = item.getTotalBytes()
      // 如果下载完成不发送事件
      if (receivedBytes !== totalBytes) {
        win.webContents.send('download-item-updated', handleDownloadItem(item, itemIndex))
      }
    })

    // 下载任务完成
    item.on('done', (e, state) => { // eslint-disable-line
      win.webContents.send('download-item-done', handleDownloadItem(item, itemIndex))
    })
  })
}

// 监听下载图片字段
export function onDownEvent (win) {
  ipcMain.on('delete-down-item', (e, index) => {
    downloadItems.splice(index, 1)
  })

  ipcMain.on('resume-item', (e, index) => {
    downloadItems[index].resume()
  })

  ipcMain.on('pause-item', (e, index) => {
    downloadItems[index].pause()
  })

  ipcMain.on('cancel-item', (e, index) => {
    try {
      downloadItems[index].cancel()
    } catch (error) {
      win.webContents.send('lose-down-item', index)
    }
  })
}

// 监听下载图片字段
export function downPhoto (win) {
  ipcMain.on('downPhoto', (e, data) => {
    newFoldName = data.path
    // 触发下载
    win.webContents.downloadURL(data.url)
  })
}

function handleDownloadItem (downloadItem, index) {
  return {
    index,
    savePath: downloadItem.getSavePath(), // 保存路径
    isPaused: downloadItem.isPaused(), // 是否暂停
    canResume: downloadItem.canResume(), // 是否可以下载
    downURL: downloadItem.getURL(), // 下载地址
    mimeType: downloadItem.getMimeType(), // MIME 类型
    hasUserGesture: downloadItem.hasUserGesture(), // 是否具有用户手势
    filename: downloadItem.getFilename(), // 下载文件名
    totalBytes: downloadItem.getTotalBytes(), // 文件总大小
    receivedBytes: downloadItem.getReceivedBytes(), // 下载项目的接收字节
    contentDisposition: downloadItem.getContentDisposition(), // 响应头中的Content-Disposition字段
    state: downloadItem.getState(), // 下载状态 progressing 下载中 completed 下载完成 cancelled 取消下载 interrupted 下载中断
    startTime: downloadItem.getStartTime() // 开始下载时间
  }
}
