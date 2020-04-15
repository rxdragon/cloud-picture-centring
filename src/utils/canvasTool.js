import axios from '@/plugins/axios.js'
import store from '@/store' // vuex
import { newMessage } from '@/utils/message.js'
import * as PhotoTool from '@/utils/photoTool'

const instanceAxios = axios.create()
instanceAxios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
instanceAxios.defaults.withCredentials = false

/**
 * @description base64ToBlob
 * @param {*} base64
 */
export function convertBase64ToBlob (base64) {
  const base64Arr = base64.split(',')
  let imgtype = ''
  let base64String = ''
  if (base64Arr.length > 1) {
    // 如果是图片base64，去掉头信息
    base64String = base64Arr[1]
    imgtype = base64Arr[0].substring(
      base64Arr[0].indexOf(':') + 1,
      base64Arr[0].indexOf(';')
    )
  }
  // 将base64解码
  const bytes = atob(base64String)
  const bytesCode = new ArrayBuffer(bytes.length)
  // 转换为类型化数组
  const byteArray = new Uint8Array(bytesCode)
  // 将base64转换为ascii码
  for (let i = 0; i < bytes.length; i++) {
    byteArray[i] = bytes.charCodeAt(i)
  }
  // 生成Blob对象（文件对象）
  return new Blob([bytesCode], { type: imgtype })
}

/**
 * @description 生成file文件
 * @param {*} blobData
 */
export function structureFile (blobData) {
  const fileType = blobData.type.split('/')
  const ext = fileType[1]
  const file = new window.File([blobData], `tag.${ext}`, { type: blobData.type })
  return file
}

/**
 * @description 添加修图机构
 */
export function uploadTagPhoto (fileData, upyunConfig) {
  const params = new FormData()
  params.append('file', fileData)
  for (const key in upyunConfig) {
    params.append(key, upyunConfig[key])
  }
  return instanceAxios({
    url: store.getters.updateDomain,
    method: 'POST',
    data: params
  }).then(res => {
    if (res.status === 200) {
      return PhotoTool.handlePicPath(res.data.url)
    } else {
      newMessage.error('上传图片失败')
    }
  })
}
