import uuidv4 from 'uuid/v4'
const path = require('path')
const fs = require('fs')

const { ipcRenderer } = require('electron')

function getFileNameTool (src) {
  const fileExt = path.extname(src)
  const fileName = path.basename(src, fileExt)
  return {
    name: fileName,
    ext: fileExt
  }
}

const downloadList = {}
let onListChange = () => {}

function getDownloadList () {
  return downloadList
}

function addDownloadFile (fileDownloadConfig) {
  const { ext } = getFileNameTool(fileDownloadConfig.url)
  const uuid = uuidv4()
  downloadList[uuid] = {
    status: 'downloading',
    savePath: '',
    canResume: false,
    process: {
      downloaded: null,
      downloadedBytes: null,
      progress: null,
      remaining: null,
      remainingBytes: null,
      speed: null,
      speedBytes: null,
      total: null,
      totalBytes: null
    },
    isUserPause: false,
    ext,
    rename: fileDownloadConfig.rename || '',
    config: fileDownloadConfig
  }

  ipcRenderer.send('download-manage:downloadFile', { uuid, downloadConfig: fileDownloadConfig })
  onListChange()
}

function addDownloadFiles (files) {
  for (const file of files) {
    addDownloadFile(file)
  }
}

function pause (uuid) {
  const result = ipcRenderer.sendSync('download-manage:pause', { uuid })

  if (result === 'fail') throw new Error('pause fail, maybe already pause or uuid not exists')
}

function resume (uuid) {
  const result = ipcRenderer.sendSync('download-manage:resume', { uuid })

  if (result === 'fail') throw new Error('pause fail, maybe not pause or uuid not exists')
}

function onDownloadProcess (event, { uuid, progress, canResume, savePath }) {
  if (uuid in downloadList) {
    downloadList[uuid].savePath = savePath
    downloadList[uuid].canResume = canResume
    downloadList[uuid].process = progress
    downloadList[uuid].status = 'downloading'
    onListChange()
  }
}

function onDownloadError (event, { uuid, errors }) {
  console.log('onDownloadError', uuid, errors)

  if (uuid in downloadList) {
    downloadList[uuid].status = 'error'
    onListChange()
  }
}

function onDownloadSuccess (event, { uuid }) {
  console.log('onDownloadSuccess', uuid)

  if (uuid in downloadList) {
    downloadList[uuid].status = 'success'
    changeSaveName(downloadList[uuid])
    // TODO 更改照片名字
    onListChange()
  }
}

function registerOnListChange (cb) {
  onListChange = cb
}

/**
 * @description 更改文件名字
 * @param {*} item
 */
export function changeSaveName (item) {
  const oldFilePath = item.savePath
  const oldDirPath = path.dirname(oldFilePath)
  const ext = item.ext
  let newFilePath = oldFilePath.replace('.cf', ext)
  if (item.rename) {
    const newFileName = item.rename
    newFilePath = path.join(oldDirPath, newFileName)
  }
  fs.rename(oldFilePath, newFilePath, (err) => {
    if (err) { console.error(err) }
  })
}

ipcRenderer.on('download-manage:process', onDownloadProcess)
ipcRenderer.on('download-manage:error', onDownloadError)
ipcRenderer.on('download-manage:success', onDownloadSuccess)

export default {
  getDownloadList,
  addDownloadFile,
  addDownloadFiles,
  pause,
  resume,
  registerOnListChange
}
