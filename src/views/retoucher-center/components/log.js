import AliyunLog from '@/api/LogSDK/AliyunLog'
import store from '@/store'

const logger = new AliyunLog(
  'cn-hangzhou.log.aliyuncs.com',
  process.env.VUE_APP_ALILOG_NAME,
  'web_tracking',
  'cloud_photo_upload_result'
)

/**
 * @description 记录上传日志
 * @param {*} file
 * @param {*} type 上传类型 ['', error, incomplete]
 */
export function logUpload (file, type) {
  const nowTime = Date.now() / 1000
  const endTime = type ? nowTime : file.response.time
  const status = type === 'refresh' ? 'incomplete' : file.status
  const data = {
    sha1Name: file.raw.sha1Name,
    startTime: file.raw.startTime,
    endTime,
    status,
    fileName: file.name,
    uid: file.uid,
    size: file.size,
    page: '云端',
    groupName: store.state.user.departmentName,
    nickName: store.state.user.nickname || store.state.user.name
  }
  logger.log(data)
}
