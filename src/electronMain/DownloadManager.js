'use strict'
const path = require('path')
const electron = require('electron')
const { BrowserWindow, net, session } = electron
const fs = require('fs')

const app = electron.app
let downloadFolder = ''
let lastWindowCreated

const queue = []

// 查看是否在队列中
const _popQueueItem = (url) => {
  const queueItem = queue.find(item => item.url === url)
  queue.splice(queue.indexOf(queueItem), 1)
  return queueItem
}

// 转换数据大小格式
const _bytesToSize = (bytes, decimals) => {
  if (bytes === 0) return '0 Bytes'
  var k = 1000
  var dm = decimals || 2
  var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  var i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// 格式化时间
const _convertTime = (input, separator) => {
  var pad = function (input) { return input < 10 ? '0' + input : input }
  return [
    pad(Math.floor(input / 3600)),
    pad(Math.floor(input % 3600 / 60)),
    pad(Math.floor(input % 60))
  ].join(typeof separator !== 'undefined' ? separator : ':')
}

// 注册监听事件
function _registerListener (win, opts = {}) {
  lastWindowCreated = win
  downloadFolder = opts.downloadFolder || downloadFolder // 下载路径

  const listener = (e, item) => {
    const itemUrl = decodeURIComponent(item.getURLChain()[0] || item.getURL())
    const queueItem = _popQueueItem(itemUrl)
    const ReceivedBytesArr = []

    if (queueItem) {
      const folder = queueItem.downloadFolder || downloadFolder
      const itemFilename = queueItem.filename
      const filePath = path.join(folder, queueItem.path, itemFilename)
      const totalBytes = item.getTotalBytes()
      let speedValue = 0
      let receivedBytes
      let PreviousReceivedBytes
      item.setSavePath(filePath)

      // 如果下载终端
      if (item.getState() === 'interrupted') {
        item.resume()
      }

      item.on('updated', () => {
        receivedBytes = item.getReceivedBytes()
        ReceivedBytesArr.push(receivedBytes)
        if (ReceivedBytesArr.length >= 2) {
          PreviousReceivedBytes = ReceivedBytesArr.shift()
          speedValue = Math.max(PreviousReceivedBytes, ReceivedBytesArr[0]) - Math.min(PreviousReceivedBytes, ReceivedBytesArr[0])
        }
        const progress = {
          progress: receivedBytes * 100 / totalBytes, // 进度
          speedBytes: speedValue, // 速度
          speed: _bytesToSize(speedValue) + '/sec', // 速度
          remainingBytes: totalBytes - receivedBytes, // 剩余
          remaining: _bytesToSize(totalBytes - receivedBytes),
          totalBytes: totalBytes, // 全部
          total: _bytesToSize(totalBytes),
          downloadedBytes: receivedBytes, // 已下载
          downloaded: _bytesToSize(receivedBytes)
        }

        const downInfo = {
          savePath: item.getSavePath(), // 保存路径
          downURL: item.getURL(), // 下载地址
          mimeType: item.getMimeType(), // MIME 类型
          hasUserGesture: item.hasUserGesture(), // 是否具有用户手势
          filename: item.getFilename(), // 下载文件名
          contentDisposition: item.getContentDisposition(), // 响应头中的Content-Disposition字段
          startTime: item.getStartTime() // 开始下载时间
        }

        if (typeof queueItem.onProgress === 'function') {
          queueItem.onProgress(progress, downInfo, item)
        }
      })

      item.on('done', (e, state) => {
        const finishedDownloadCallback = queueItem.callback || function () {}

        if (!win.isDestroyed()) {
          win.setProgressBar(-1)
        }
        // 如果下载中断
        if (state === 'interrupted') {
          const message = `该文件${item.getFilename()} 下载中断`
          finishedDownloadCallback(new Error(message), { url: item.getURL(), filePath })
        } else if (state === 'completed') {
          if (process.platform === 'darwin') {
            app.dock.downloadFinished(filePath)
          }
          finishedDownloadCallback(null, { url: item.getURL(), filePath })
        }
      })
    }
  }

  win.webContents.session.on('will-download', listener)
}

// 单文件下载
const download = (options, callback) => {
  const win = BrowserWindow.getFocusedWindow() || lastWindowCreated
  options = Object.assign({}, { path: '' }, options)
  const request = net.request(options.url)
  const filename = (options.uuid + '.download') || decodeURIComponent(path.basename(options.url))
  const url = decodeURIComponent(options.url)
  const folder = options.downloadFolder || downloadFolder
  const filePath = path.join(folder, options.path.toString(), filename.split(/[?#]/)[0])
  if (options.headers) {
    options.headers.forEach((h) => { request.setHeader(h.name, h.value) })

    // Modify the user agent for all requests to the following urls.
    const filter = {
      urls: [options.url]
    }

    session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
      options.headers.forEach((h) => { details.requestHeaders[h.name] = h.value })
      // details.requestHeaders['User-Agent'] = 'MyAgent'
      callback({ cancel: false, requestHeaders: details.requestHeaders })
    })
  }
  if (typeof options.onLogin === 'function') {
    request.on('login', options.onLogin)
  }
  request.on('error', function (error) {
    const finishedDownloadCallback = callback || function () { }
    const message = `The request for ${filename} was interrupted: ${error}`
    finishedDownloadCallback(new Error(message), { url: options.url, filePath: filePath })
  })

  request.on('response', function (response) {
    // 下载终止
    request.abort()
    // 添加队列
    queue.push({
      url: url, // 下载地址
      filename: filename, // 文件名字
      rename: options.rename, // 是否重命名
      downloadFolder: options.downloadFolder,
      path: options.path.toString(), // 储存地址
      callback: callback, // 回调函数
      onProgress: options.onProgress // 监听下载
    })

    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath)
      const fileOffset = stats.size
      const serverFileSize = parseInt(response.headers['content-length'])

      // 判断本地文件和服务器文件大小
      if (fileOffset < serverFileSize) {
        options = {
          path: filePath,
          urlChain: [options.url],
          offset: parseInt(fileOffset),
          length: serverFileSize,
          lastModified: response.headers['last-modified']
        }
        win.webContents.session.createInterruptedDownload(options)
      } else {
        console.log(filename + '本地文件大于等于服务器文件，不需要下载')
        const finishedDownloadCallback = callback || function () {}
        finishedDownloadCallback(null, { url, filePath })
      }
    } else {
      console.log(filename + '本地未下载，开始下载')
      win.webContents.downloadURL(options.url)
    }
  })
  request.end()
}

// 批量下载
const bulkDownload = (options, callback) => {
  options = Object.assign({}, { urls: [], path: '' }, options)

  const urlsCount = options.urls.length
  const finished = []
  const errors = []

  options.urls.forEach((url) => {
    download({ url, path: options.path, onProgress: options.onProgress }, function (error, itemInfo) {
      if (error) {
        errors.push(itemInfo.url)
      } else {
        finished.push(itemInfo.url)
      }

      const errorsCount = errors.length
      const finishedCount = finished.length

      if (typeof options.onResult === 'function') {
        options.onResult(finishedCount, errorsCount, itemInfo.url)
      }

      if ((finishedCount + errorsCount) === urlsCount) {
        if (errorsCount > 0) {
          callback(new Error(errorsCount + ' downloads failed'), finished, errors)
        } else {
          callback(null, finished, [])
        }
      }
    })
  })
}

// 注册
const register = (opts = {}) => {
  app.on('browser-window-created', (e, win) => {
    _registerListener(win, opts)
  })
}

module.exports = {
  register,
  download,
  bulkDownload
}
