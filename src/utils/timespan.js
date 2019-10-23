/**
 * @description 拼接时间参数处理
 * @param {*} time
 * @param {*} addDay
 */
export function joinTimeSpan (time, addDay) {
  const reg = /^\d{4}-\d{2}-\d{2}\s+([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/
  const reg2 = /^\d{4}-\d{2}-\d{2}/
  const res = reg.test(time)
  if (!res) {
    let regArr = reg2.exec(time)
    if (addDay) {
      time = new Date(time)
      time = time.setDate(time.getDate() + 1)
      regArr = new Date(time).toLocaleDateString().replace(/\//g, '-')
    }
    time = `${regArr} 08:00:00`
  }
  return time
}
