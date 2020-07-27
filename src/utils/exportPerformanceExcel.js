import moment from 'moment'
import { exportNoHeaderExcel } from '@/utils/exportExcelUtil.js'

export const headerCellkeys = ['name', 'nickName', 'staffNum', 'score']
export const headerCellName = ['伙伴姓名', '花名', '工号', '绩效得分']

/**
 * @description 下载绩效模版
 * @param {*} couponTitle 
 * @param {*} data 
 */
export default function exportPerformanceExcel (couponTitle, data) {
  const excelName = couponTitle + '-绩效'
  exportNoHeaderExcel(data, excelName, headerCellName, headerCellkeys)
}

/**
 * @description 获取打分日期
 */
export function getGradeMouth () {
  const nowDate = moment(new Date())
  const day = nowDate.date()
  if (day < 10) {
    const month = nowDate.add(-1, 'month')
    return month.format('MM')
  }
  return nowDate.format('MM')
}

/**
 * @description 获取打分日期
 */
export function getSearchMonth () {
  const nowDate = moment()
  const day = nowDate.date()
  if (day < 20) {
    const month = nowDate.add(-1, 'month')
    return month.format('YYYYMM')
  }
  return nowDate.format('YYYYMM')
}
