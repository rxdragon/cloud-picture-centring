import uuidv4 from 'uuid/v4'
import Vue from 'vue'
import store from '@/store'
import { getFileIcon } from '@/utils/getFileIcon.js'
import * as mPath from '@/utils/selfPath.js'
const fs = require('fs')
const { ipcRenderer } = require('electron')

const waitDownloadList = [] // 等待下载队列
const downingLoadList = [] // 正在下载队列
const downloadList = {} // 队列信息

let onListChange = () => {}

// 获取文件名
function getFileNameTool (src) {
  const fileExt = mPath.getExtName(src)
  const fileName = mPath.getBaseName(src, fileExt)
  return {
    name: fileName,
    ext: fileExt
  }
}

// 获取队列
function getDownloadList () {
  return downloadList
}

// 自增文件名字
function incrementFileName (savePath) {
  let fileNum = 0
  const dir = mPath.getDirname(savePath)
  const { name, ext } = getFileNameTool(savePath)
  while (fs.existsSync(savePath)) {
    fileNum += 1
    savePath = mPath.getFormat({
      dir,
      ext,
      name: `${name}(${fileNum})`
    })
  }
  return savePath
}

// 限流下载
function limitDownCount (uuid) {
  const maxCount = 5
  if (uuid) {
    const findDeleteIndex = downingLoadList.findIndex(item => item.config.uuid === uuid)
    if (findDeleteIndex >= 0) { downingLoadList.splice(findDeleteIndex, 1) }
  }
  if (downingLoadList.length < maxCount) {
    let takeCount = maxCount - downingLoadList.length
    if (waitDownloadList.length < takeCount) {
      takeCount = waitDownloadList.length
    }
    for (let index = 0; index < takeCount; index++) {
      const item = waitDownloadList[index]
      const downreq = {
        uuid: item.config.uuid,
        downloadConfig: item.config
      }
      const result = ipcRenderer.sendSync('download-manage:downloadFile', downreq)
      if (result === 'fail') throw new Error('pause fail, maybe already pause or uuid not exists')
      downingLoadList.push(item)
      waitDownloadList.splice(index, 1)
    }
  }
}

// 添加下载
function addDownloadFile (fileDownloadConfig) {
  const { name, ext } = getFileNameTool(fileDownloadConfig.url)
  const uuid = uuidv4()
  const folderPath = store.getters.saveFolder
  console.log(folderPath, 'folderPath')
  fileDownloadConfig.path = mPath.joinPath(folderPath, fileDownloadConfig.path)
  console.log(fileDownloadConfig.path, 'fileDownloadConfig.path')
  // TODO 已存在文件名不进行下载
  fileDownloadConfig.uuid = uuid
  const createData = {
    status: 'waitdown', // 下载状态 progressing 下载中 completed 下载完成 cancelled 取消下载 interrupted 下载中断
    canResume: false, // 是否可以重新下载
    isUserPause: false, // 是否是用户暂停
    orginName: name, // 原始文件名字
    ext, // 后缀 初始不可更改
    rename: fileDownloadConfig.rename || '',
    process: {},
    downInfo: {},
    savePath: mPath.joinPath(fileDownloadConfig.path, (uuid + '.download')),
    config: fileDownloadConfig,
    iconSrc: ''
  }
  createData.fileName = createData.rename || (createData.orginName + createData.ext)
  Vue.prototype.$set(downloadList, uuid, createData)
  waitDownloadList.push(downloadList[uuid])
  limitDownCount()
  onListChange()
}

// 批量下载
function addDownloadFiles (files) {
  const imgDomain = store.getters.imgDomain
  Vue.prototype.$newMessage.success(`已添加${files.length}张照片至下载`)
  files.forEach(file => {
    file.url = imgDomain + file.url
    addDownloadFile(file)
  })
}

// 暂停
function pause (uuid) {
  const result = ipcRenderer.sendSync('download-manage:pause', { uuid })
  if (result === 'fail') throw new Error('pause fail, maybe already pause or uuid not exists')
  downloadList[uuid].status = 'progressing'
  downloadList[uuid].isUserPause = true
  onListChange()
}

// 恢复下载
function resume (uuid) {
  const result = ipcRenderer.sendSync('download-manage:resume', { uuid })
  if (result === 'fail') throw new Error('pause fail, maybe not pause or uuid not exists')
  downloadList[uuid].status = 'interrupted'
  downloadList[uuid].isUserPause = false
  onListChange()
}

// 删除完成或者未开始项
function deleteItem (uuid) {
  if (downloadList[uuid].status !== 'completed') {
    const result = ipcRenderer.sendSync('download-manage:delete', { uuid })
    if (result === 'fail') throw new Error('pause fail, maybe not pause or uuid not exists')
  }
  const findDeleteIndex = waitDownloadList.findIndex(item => item.config.uuid === uuid)
  if (findDeleteIndex >= 0) waitDownloadList.splice(findDeleteIndex, 1)
  Vue.prototype.$delete(downloadList, uuid)
  onListChange()
}

// 将完成项目转移到 列表
async function transferToVuexList (uuid) {
  await store.dispatch('downloadlist/addDownloadItem', { downloadItem: downloadList[uuid] })
  deleteItem(uuid)
}

// 清空所有数据
function clearAll () {
  for (const uuid in downloadList) {
    if (downloadList[uuid].status === 'completed' || downloadList[uuid].status === 'status') {
      delete downloadList[uuid]
    }
  }
  onListChange()
}

// 取消下载
function cancel (uuid) {
  const result = ipcRenderer.sendSync('download-manage:cancel', { uuid })
  if (result === 'fail') throw new Error('pause fail, maybe not pause or uuid not exists')
  downloadList[uuid].status = 'cancelled'
  limitDownCount(uuid)
  onListChange()
}

/**
 * @description 监听下载
 * @param {Object} 事件
 * @param {String} uuid
 * @param {String} progress 进度信息
 * @param {String} downInfo 下载信息
 * @param {String} status 错误信息
 * @param {String} canResume 是否可以回复下载
 */
async function onDownloadProcess (event, { uuid, progress, downInfo, status, canResume }) {
  if (uuid in downloadList) {
    Vue.prototype.$set(downloadList[uuid], 'canResume', canResume)
    Vue.prototype.$set(downloadList[uuid], 'process', progress)
    Vue.prototype.$set(downloadList[uuid], 'status', status)
    Vue.prototype.$set(downloadList[uuid], 'downInfo', downInfo)
    const iconSrc = await getFileIcon(downloadList[uuid].savePath)
    Vue.prototype.$set(downloadList[uuid], 'iconSrc', iconSrc)
    onListChange()
  }
}

/**
 * @description 监听下载出错
 * @param {Object} 事件
 * @param {String} uuid
 * @param {String} errors 错误信息
 */
function onDownloadError (event, { uuid, errors }) {
  if (uuid in downloadList) {
    downloadList[uuid].status = 'interrupted'
    limitDownCount(uuid)
    console.error(uuid, 'error')
    onListChange()
  }
}

/**
 * @description 监听下载成功
 * @param {Object} 下载事件
 * @param {String} uuid
 */
function onDownloadSuccess (event, { uuid }) {
  if (uuid in downloadList) {
    Vue.prototype.$set(downloadList[uuid], 'status', 'completed')
    limitDownCount(uuid)
    changeSaveName(downloadList[uuid])
  }
}

// 列表改变回调
function registerOnListChange (cb) {
  onListChange = cb
}

/**
 * @description 更改文件名字
 * @param {*} item
 */
export function changeSaveName (item) {
  const oldFilePath = item.downInfo.savePath
  console.log(oldFilePath, 'oldFilePath')
  const oldDir = mPath.getDirname(oldFilePath)
  console.log(oldDir, 'oldDir')
  let newFileName = item.orginName + item.ext
  if (item.rename) { newFileName = item.rename }
  let newFilePath = mPath.joinPath(oldDir, newFileName)
  console.log(newFilePath, 'newFilePath')
  newFilePath = incrementFileName(newFilePath)
  fs.rename(oldFilePath, newFilePath, async (err) => {
    if (err) { console.error(err) }
    item.savePath = newFilePath
    item.iconSrc = await getFileIcon(newFilePath)
    onListChange()
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
  deleteItem,
  clearAll,
  cancel,
  registerOnListChange,
  transferToVuexList
}
