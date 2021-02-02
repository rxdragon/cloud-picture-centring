import Idb from 'idb-js' //  引入Idb
import store from '@/store'
import db_cloud_config from './db_cloud_config'
import * as Setting from './getSetting.js'
const { app } = require('electron').remote
const downloadFolder = app.getPath('desktop')

export default function initIndexDb (resetData) {
  // eslint-disable-next-line new-cap
  return Idb(db_cloud_config)
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

      await initWorkbenchInfo()

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

/**
 * @description 初始化工作台信息
 */
export async function initWorkbenchInfo () {
  const workbenchInfoObj = await Setting.getSetting('workbenchInfo')
  const workbenchInfo = workbenchInfoObj ? workbenchInfoObj.settingValue : ''
  const baseInfo = {
    top: 0,
    left: 0,
    width: 400,
    height: 200,
    mode: 'sunny'
  }

  if (!workbenchInfo) {
    await Setting.setSetting('workbenchInfo', baseInfo)
  }
}

/**
 * @description 获取工作台信息
 */
export async function getWorkbenchInfo () {
  const workbenchInfoObj = await Setting.getSetting('workbenchInfo')
  const workbenchInfo = workbenchInfoObj ? workbenchInfoObj.settingValue : ''
  const baseInfo = {
    top: 0,
    left: 0,
    width: 400,
    height: 200,
    mode: 'sunny'
  }
  return workbenchInfo || baseInfo
}

/**
 * @description 更新信息
 * @param {*} param0 
 */
export async function updateWorkbenchInfo ({ width, height, top, left, mode }) {
  const workbenchInfoObj = await Setting.getSetting('workbenchInfo')
  const workbenchInfo = workbenchInfoObj ? workbenchInfoObj.settingValue : {}
  if (width) workbenchInfo.width = width
  if (height) workbenchInfo.height = height
  if (top) workbenchInfo.top = top
  if (left) workbenchInfo.width = left
  if (mode) workbenchInfo.mode = mode
  await Setting.updateSetting('workbenchInfo', workbenchInfo)
}
