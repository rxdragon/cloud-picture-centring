import Idb from 'idb-js' //  引入Idb
import store from '@/store'
import db_cloud_config from './db_cloud_config'
import * as Setting from './getSetting.js'
const { app } = require('electron').remote
const downloadFolder = app.getPath('desktop')

Idb(db_cloud_config)
  .then(async cloud_db => {
    window.CloudDb = cloud_db
    const savePathObj = await Setting.getSavePath()
    const savePath = savePathObj ? savePathObj.settingValue : downloadFolder
    store.dispatch('setting/setSavePath', savePath)
    if (!savePathObj) { Setting.setSavePath(downloadFolder) }
    // 缓存开关
    const imageCacheSwitchObj = await Setting.getSetting('imageCacheSwitch')
    const imageCacheSwitch = imageCacheSwitchObj ? imageCacheSwitchObj.settingValue : 0
    store.dispatch('setting/setImageCacheSwitch', imageCacheSwitch)
    if (!imageCacheSwitch) { Setting.setSetting('imageCacheSwitch', imageCacheSwitch) }
  })
  .catch(err => {
    console.error(err)
  })
