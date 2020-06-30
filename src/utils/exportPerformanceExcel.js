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
  if (day >= 20) {
    let month = nowDate.month()
    return month + 1
  }
  if (day <= 10) {
    let month = nowDate.month()
    return month
  }
  return nowDate.month() + 1
}
