import { exportNoHeaderExcel } from '@/utils/exportExcelUtil.js'

export const headerCellkeys = ['name', 'staffNum', 'score']
export const headerCellName = ['伙伴姓名（花名）', '工号', '绩效得分']

/**
 * @description 下载绩效模版
 * @param {*} couponTitle 
 * @param {*} data 
 */
export default function exportPerformanceExcel (couponTitle, data) {
  const excelName = couponTitle + '-绩效'
  exportNoHeaderExcel(data, excelName, headerCellName, headerCellkeys)
}
