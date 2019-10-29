const { shell } = require('electron')
import fs from 'fs'

export const openFile = (path) => {
  if (!fs.existsSync(path)) return false // 文件不存在的情况
  shell.openItem(path) // 打开文件
  return true
}

export const openFileFolder = (path) => {
  if (!fs.existsSync(path)) { // 文件不存在
    return false
  }
  shell.showItemInFolder(path) // 打开文件所在文件夹
  return true
}
