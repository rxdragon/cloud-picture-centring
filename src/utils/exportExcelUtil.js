import { Excel } from 'mainto-fed-utils'

/**
 * @description 导出表格
 */
export function exportExcel (data, excelName = '表格', headerCellName, headerCellkeys) {
  const option = {
    header: [
      { 0: excelName },
      [...headerCellName]
    ],
    keys: headerCellkeys,
    autoWidth: true
  }
  const excel = new Excel(data, option)
  const excelSave = excel.save()
  excelSave.tmpWB.Sheets.sheet['A1'].s = {
    font: { sz: 24, name: '微软雅黑' },
    alignment: {
      horizontal: 'center'
    }
  }
  excelSave.down(excelName)
}


/**
 * @description 导出表格
 */
export function exportNoHeaderExcel (data, excelName = '表格', headerCellName, headerCellkeys) {
  const option = {
    header: [
      [...headerCellName]
    ],
    keys: headerCellkeys,
    autoWidth: true
  }
  const excel = new Excel(data, option)
  const excelSave = excel.save()
  excelSave.down(excelName)
}
