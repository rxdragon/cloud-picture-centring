import Idb from 'idb-js' //  引入Idb
import store from '@/store'
import db_cloud_config from './db_cloud_config'
import * as Setting from './getSetting.js'
const { app } = require('electron').remote
const downloadFolder = app.getPath('desktop')

Idb(db_cloud_config)
  .then(async cloud_db => {
    window.CloudDb = cloud_db
    let savePath = await Setting.getSavePath()
    if (!savePath) {
      Setting.setSavePath(downloadFolder)
      savePath = downloadFolder
    }
    const { settingValue } = savePath
    store.dispatch('setting/setSavePath', settingValue)
  })
  .catch(err => {
    console.error(err)
  })
