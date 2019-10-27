/**
 * @description 清除session缓存
 */
export function removeSession () {
  sessionStorage.removeItem('sso-token')
  sessionStorage.removeItem('userInfo')
  sessionStorage.removeItem('xStreamIdExpireTime')
  sessionStorage.removeItem('xStreamId')
  localStorage.clear()
}

/**
 * @description 存储userInfo
 * @param {*} info
 */
export function setUserInfo (info) {
  const data = JSON.stringify(info)
  sessionStorage.setItem('userInfo', data)
}

/**
 * @description
 * @param {*} code
 */
export function getUserInfo (code) {
  try {
    const data = sessionStorage.getItem('userInfo')
    return JSON.parse(data)
  } catch (error) {
    return null
  }
}

/**
 * @description 设置沙漏过期时间
 * @param {*} time
 */
export function setXStreamIdExpireTime (time) {
  sessionStorage.setItem('xStreamIdExpireTime', time)
}

/**
 * @description 设置沙漏过期时间
 * @param {*} time
 */
export function getStreamIdExpireTime (time) {
  const returnTime = sessionStorage.getItem('xStreamIdExpireTime')
  return returnTime
}

/**
 * @description 存储xStreamId
 * @param {*} code
 */
export function setXStreamId (code) {
  sessionStorage.setItem('xStreamId', code)
}

/**
 * @description 获取XStreamId
 * @param {*} params
 */
export function getXStreamId (params) {
  return sessionStorage.getItem('xStreamId')
}

/**
 * @description 储存挂起订单照片
 * @param {*} streamId
 * @param {*} finishPhoto
 */
export function saveUpdatePhoto (streamId, finishPhoto) {
  const key = streamId + 'photo'
  const data = JSON.stringify(finishPhoto)
  localStorage.setItem(key, data)
}

/**
 * @description 移除挂起订单照片
 * @param {*} streamId
 */
export function removeUpdatePhoto (streamId) {
  const key = streamId + 'photo'
  localStorage.removeItem(key)
}

/**
 * @description 获取挂起订单照片
 * @param {*} streamId
 */
export function getUpdatePhoto (streamId) {
  const key = streamId + 'photo'
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : []
}

/**
 * @description 储存下载列表数据
 * @param {*} cacheData
 */
export function setCacheDownloadList (data) {
  const cacheData = JSON.stringify(data)
  localStorage.setItem('cacheDownloadList', cacheData)
}

/**
 * @description 获取下载列表
 */
export function getCacheDownloadList () {
  const getCacheData = localStorage.getItem('cacheDownloadList')
  return getCacheData ? JSON.parse(getCacheData) : []
}

/**
 * @description 保存确定流水
 */
export function saveSureRetouchOrder (aid) {
  const saveKey = `save-retouch-id${aid}`
  localStorage.setItem(saveKey, 'sure')
}

/**
 * @description 获取保存确定流水
 */
export function getSureRetouchOrder (aid) {
  const saveKey = `save-retouch-id${aid}`
  const getDatra = localStorage.getItem(saveKey)
  return getDatra
}

/**
 * @description 移除确定流水
 */
export function removeSureRetouchOrder (aid) {
  const saveKey = `save-retouch-id${aid}`
  localStorage.removeItem(saveKey)
}
