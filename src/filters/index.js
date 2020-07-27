import { timeFormat } from '@/utils/index.js'
import { formatTime } from '@/utils/timespan.js'
import { PhotoEnumName, retouchStandardToCN, HourGlassSettingEnum, StreamState } from '@/utils/enumerate.js'

/**
 * 10000 => "10,000"
 * @param {number} num
 */
export function toThousandFilter (num) {
  return (+num || 0).toString().replace(/^-?\d+/g, m => m.replace(/(?=(?!\b)(\d{3})+$)/g, ','))
}

/**
 * 0 => "0.00"
 * @param {number} num
 */
export function toFixedString (num) {
  num = Number(num)
  if (isNaN(num)) return '0.00'
  return num.toFixed(2)
}

/**
 * @description 获取照片版本对于名字
 * @param {*} str
 */
export function toPhotoVerName (str) {
  return PhotoEnumName[str]
}

/**
 * @description 转换修图类型
 * @param {*} str
 */
export function toRetouchClass (str) {
  return retouchStandardToCN[str] || '异常'
}

/**
 * @description 修图状态
 * @param {*} state
 */
export function toStreamState (state) {
  return StreamState[state]
}

/**
 * @description 更改名字
 * @param {*} value
 */
export function toLabelName (value) {
  switch (value) {
    case 'big':
      return '大'
    case 'middle':
      return '中'
    case 'small':
      return '小'
    case 'not_required':
      return '不要求'
    default:
      return '异常'
  }
}

/**
 * @description 伙伴范围
 * @param {*} value
 */
export function toRangeChange (value) {
  return HourGlassSettingEnum[value]
}

/**
 * @description 时间更改
 * @param {*} time
 */
export function toTimeFormat (time) {
  return timeFormat(time)
}

/**
 * @description 时间转化中文
 * @param {*} time
 */
export function toTimeFormatText (time) {
  return timeFormat(time, 'text', true)
}

/**
 * @description 格式化时间
 * @param {*} time
 */
export function toTimeSpan (time) {
  return formatTime(time)
}
