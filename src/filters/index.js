import { timeFormat } from '@/utils/index.js'
import { PhotoEnumName, RetouchStandard, HourGlassSettingEnum, StreamState } from '@/utils/enumerate.js'

/**
 * 10000 => "10,000"
 * @param {number} num
 */
export function toThousandFilter (num) {
  return (+num || 0).toString().replace(/^-?\d+/g, m => m.replace(/(?=(?!\b)(\d{3})+$)/g, ','))
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
  return RetouchStandard()[str]
}

/**
 * @description 修图状态
 * @param {*} state
 */
export function toStreamState (state) {
  return StreamState()[state]
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

