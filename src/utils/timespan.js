/**
 * @description 拼接时间参数处理
 * @param {*} time
 * @param {*} addDay
 */
import moment from 'moment'

export function joinTimeSpan (time, addDay) {
  const date = moment(time)
  if (addDay) {
    date.add(1, 'day')
  }

  return date.format('YYYY-MM-DD 08:00:00')
}

export function revertTimeSpan (time, subtractDay) {
  const date = moment(time)
  if (subtractDay) {
    date.subtract(1, 'days')
  }
  return date.format('YYYY-MM-DD')
}

/**
 * @description 格式化时间
 * @param {*} time
 */
export function formatTime (time) {
  if (time === '-') return '-'
  const date = moment(time)
  return date.format('YYYY.MM.DD hh:mm')
}
