import Idb from 'idb-js' //  引入Idb
import store from '@/store'
import db_cloud_config from './db_cloud_config'
import * as Setting from './getSetting.js'
const { app } = require('electron').remote
const downloadFolder = app.getPath('desktop')

export default function initIndexDb (resetData) {
  // eslint-disable-next-line new-cap
  Idb(db_cloud_config)
    .then(async cloud_db => {
      window.CloudDb = cloud_db
      if (!resetData) return

      await initSavePath()

      // 缓存开关
      await initImageCacheSwitch()

      // 客片池无限下拉开关
      await initGuestInfiniteScroll()

      // 缓存是否显示隐藏数据显示
      await initShowRecord()

      // 工作看板
      await initShowWorkbenc()

      // 工作看板位置
      await initWorkbenchLocation()

    })
    .catch(err => {
      console.error(err)
    })
}


/**
 * @description 初始化配置
 */
export async function initSavePath () {
  const savePathObj = await Setting.getSavePath()
  const savePath = savePathObj ? savePathObj.settingValue : downloadFolder
  store.dispatch('setting/setSavePath', savePath)
  if (!savePathObj) {
    Setting.setSavePath(downloadFolder)
  }
}

/**
 * @description 图片缓存开关初始化
 */
export async function initImageCacheSwitch () {
  const imageCacheSwitchObj = await Setting.getSetting('imageCacheSwitch')
  const imageCacheSwitch = imageCacheSwitchObj ? imageCacheSwitchObj.settingValue : 0
  store.dispatch('setting/setImageCacheSwitch', imageCacheSwitch)
  if (!imageCacheSwitch) {
    Setting.setSetting('imageCacheSwitch', imageCacheSwitch)
  }
}

/**
 * @description 初始化客片池无限下拉开关
 */
export async function initGuestInfiniteScroll () {
  const guestInfiniteScrollObj = await Setting.getSetting('guestInfiniteScroll')
  const guestInfiniteScroll = guestInfiniteScrollObj ? guestInfiniteScrollObj.settingValue : 0
  store.dispatch('setting/setGuestInfiniteScroll', guestInfiniteScroll)
  if (!guestInfiniteScroll) {
    Setting.setSetting('guestInfiniteScroll', guestInfiniteScroll)
  }
}

/**
 * @description 初始化数据隐藏开关
 * @param {*} params 
 */
export async function initShowRecord () {
  const showRecordObj = await Setting.getSetting('showRecord')
  const showRecord = showRecordObj ? showRecordObj.settingValue : 0
  store.dispatch('setting/setShowRecord', showRecord)
  if (!showRecord) {
    Setting.setSetting('showRecord', showRecord)
  }
}

/**
 * @description 工作看板
 * @param {*} params 
 */
export async function initShowWorkbenc () {
  const showWorkbenchObj = await Setting.getSetting('showWorkbench')
  const showWorkbench = showWorkbenchObj ? showWorkbenchObj.settingValue : 0
  store.dispatch('setting/setShowWorkbench', showWorkbench)
  if (!showWorkbench) {
    Setting.setSetting('showWorkbench', showWorkbench)
  }
}

/**
 * @description 初始化 
 * @param {*} params 
 */
export async function initWorkbenchLocation () {
  const workbenchLocationObj = await Setting.getSetting('workbenchLocation')
  const workbenchLocation = workbenchLocationObj ? workbenchLocationObj.settingValue : ''
  if (!workbenchLocation) {
    Setting.setSetting('workbenchLocation', 'app')
  } else {
    store.dispatch('setting/setWorkbenchLocation', workbenchLocation)
  }
}
