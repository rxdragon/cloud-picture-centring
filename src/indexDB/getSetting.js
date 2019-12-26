
/**
 * @description 获取保存路径
 */
export function getSavePath () {
  return new Promise(resolve => {
    window.CloudDb.query_by_index({
      tableName: 'setting',
      indexName: 'settingKey',
      target: 'savePath',
      success: res => resolve(res),
      error: () => resolve(null)
    })
  })
}

/**
 * @description 设置保存路径
 * @param {*} value
 */
export function setSavePath (value) {
  return new Promise((resolve, reject) => {
    window.CloudDb.insert({
      tableName: 'setting',
      data: {
        settingKey: 'savePath',
        settingValue: value
      },
      success: () => resolve(),
      error: err => reject(err)
    })
  })
}

/**
 * @description 更新保存路径
 * @param {*} value
 */
export function updateSavePath (value) {
  return new Promise((resolve, reject) => {
    window.CloudDb.update({
      tableName: 'setting',
      condition: item => item.settingKey === 'savePath',
      handle: r => {
        r.settingValue = value
      },
      success: () => resolve()
    })
  })
}

/**
 * @description 获取自动开启按钮开关
 */
export function getSetting (key) {
  return new Promise(resolve => {
    window.CloudDb.query_by_index({
      tableName: 'setting',
      indexName: 'settingKey',
      target: key,
      success: res => resolve(res),
      error: () => resolve(null)
    })
  })
}

/**
 * @description 设置缓存开关
 * @param {*} value
 */
export function setSetting (key, value) {
  return new Promise((resolve, reject) => {
    window.CloudDb.insert({
      tableName: 'setting',
      data: {
        settingKey: key,
        settingValue: value
      },
      success: () => resolve(),
      error: err => reject(err)
    })
  })
}

/**
 * @description 更新保存路径
 * @param {*} value
 */
export function updateSetting (key, value) {
  return new Promise((resolve, reject) => {
    window.CloudDb.update({
      tableName: 'setting',
      condition: item => item.settingKey === key,
      handle: r => {
        r.settingValue = value
      },
      success: () => resolve()
    })
  })
}
