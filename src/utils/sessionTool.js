/**
 * @description 清除session缓存
 */
export function removeSession () {
  sessionStorage.clear()
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
 * @description 存储用户权限
 * @param {*} permission
 */
export function setUserPermission (permission) {
  const data = JSON.stringify(permission)
  sessionStorage.setItem('userPermission', data)
}

/**
 * @description
 * @param {*} code 获取用户权限
 */
export function getUserPermission () {
  try {
    const data = sessionStorage.getItem('userPermission')
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

/**
 * @description 保存退单流水
 */
export function saveReturnRetouchOrder (aid) {
  const saveKey = `return-retouch-id`
  let returnArr = JSON.parse(localStorage.getItem(saveKey)) || []
  returnArr = new Set([...returnArr])
  returnArr.add(aid)
  const data = JSON.stringify([...returnArr])
  localStorage.setItem(saveKey, data)
}

/**
 * @description 获取是否已保存退单流水
 */
export function getReturnRetouchOrder (aid) {
  const saveKey = `return-retouch-id`
  const returnArr = JSON.parse(localStorage.getItem(saveKey))
  return returnArr ? returnArr.includes(aid) : false
}

/**
 * @description 移除重修确定流水
 */
export function removeReturnRetouchOrder (aid) {
  const saveKey = `return-retouch-id`
  let returnArr = JSON.parse(localStorage.getItem(saveKey))
  returnArr = new Set(returnArr)
  returnArr.delete(aid)
  const data = JSON.stringify([...returnArr])
  localStorage.setItem(saveKey, data)
}

/**
 * @description 设置云端抽片最后一张照片地址
 */
export function setCloudAssessmentPhotoId (photoArr) {
  const saveKey = `cloud-assessment-last-photoId`
  let data = photoArr.map(item => item.id)
  data = JSON.stringify(data)
  localStorage.setItem(saveKey, data)
}

/**
 * @description 获取云端抽片最后一张照片地址
 */
export function getCloudAssessmentPhotoId () {
  const saveKey = `cloud-assessment-last-photoId`
  const data = localStorage.getItem(saveKey)
  return JSON.parse(data)
}

/**
 * @description 获取云端抽片最后一张照片地址
 */
export function removeCloudAssessmentPhotoId () {
  const saveKey = `cloud-assessment-last-photoId`
  localStorage.removeItem(saveKey)
}

/**
 * @description 清楚全部数据
 */
export function clearAllStorage () {
  localStorage.clear()
  sessionStorage.clear()
}

/**
 * @description 保存伙伴数据
 */
export function saveStaffList (staffInfo) {
  const saveKey = `staff-info`
  const data = JSON.stringify(staffInfo)
  localStorage.setItem(saveKey, data)
}

/**
 * @description 获取伙伴列表
 */
export function getStaffList () {
  const saveKey = `staff-info`
  const data = localStorage.getItem(saveKey)
  return data ? JSON.parse(data) : null
}

/**
 * @description 获取主管列表
 */
export function getExecutiveList () {
  const saveKey = `executive`
  const data = localStorage.getItem(saveKey)
  return data ? JSON.parse(data) : null
}

/**
 * @description 保存主管列表
 * @param {*} params
 */
export function setExecutiveList (executiveList) {
  const saveKey = `executive`
  const data = JSON.stringify(executiveList)
  localStorage.setItem(saveKey, data)
}
