import { PHOTO_FLAG } from '@/utils/enumerate.js'
import AliyunLog from '@/api/LogSDK/AliyunLog'
import * as PhotoTool from '@/utils/photoTool'

const logger = new AliyunLog(
  'cn-hangzhou.log.aliyuncs.com',
  process.env.VUE_APP_ALILOG_NAME,
  'web_tracking',
  'cloud_auto_retouch_result'
)

/**
 * @description 下载记录
 * @param {*} key 
 * @param {*} type 
 */
export function downLog (key, flag) {
  if (flag === PHOTO_FLAG.ORIGINAL) return
  const type = 'down'
  const data = { key, flag, type }
  logger.log(data)
}

/**
 * @description 记录上传埋点
 * @param {*} uploadArr 
 */
export function uploadLog (uploadArr) {
  const type = 'upload'
  uploadArr.forEach(photoItem => {
    const file = photoItem.file
    if (!file) return
    const localFileName = file.name
    const uploadedName = _.get(file, 'response.url') || ''
    if (localFileName.includes(`~${PHOTO_FLAG.CROP}`) || localFileName.includes(`~${PHOTO_FLAG.WARP}`)) {
      const key = photoItem.autoKey
      const orginPhotoName = photoItem.orginPhotoName
      const localFileNameNotExt = PhotoTool.fileNameFormat(localFileName)
      const flag = localFileNameNotExt.replace(`${orginPhotoName}~`, '')
      const data = { key, flag, uploadedName, type }
      logger.log(data)
    }
  })
}

/**
 * @description 埋点数据
 * @param {*} key 
 * @param {*} error 
 */
export function autoErr (key, error) {
  const type = 'error'
  const data = { key, error, type }
  logger.log(data)
}

/**
 * @description 处理为空
 * @param {*} key 
 * @param {*} msg 
 */
export function handleEmpty (key, msg) {
  const type = 'empty'
  const data = { key, msg, type }
  logger.log(data)
}
