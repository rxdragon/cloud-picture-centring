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
