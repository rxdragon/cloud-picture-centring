const colors = [0, 29, 47, 86, 120, 146, 169, 194, 220, 236, 262, 289, 314, 342]
export const pieColors = [
  '#e84141',
  '#fe9c43',
  '#f6c92a',
  '#8BDD22',
  '#13BE13',
  '#1B9750',
  '#00BE9B',
  '#15BAEB',
  '#0092BE',
  '#276EFA',
  '#3742D7',
  '#853FFA',
  '#CF33F2',
  '#F73ECD',
  '#FF3873',
  '#C21F1F',
  '#DB6D09',
  '#FFE300'
]

/**
 * @description 获取颜色
 * @param {*} index 
 */
export function getColor (allColor, index) {
  const interval = 360 / allColor
  const h = index * interval
  return `hsl(${h}, 78%, 63%)`
}

export function getColorNear (allColor, paramIndex, selfIndex) {
  const interval = 360 / allColor
  const h = paramIndex * interval
  const newH = h + 15 * (selfIndex + 1)
  return `hsl(${newH}, 78%, 58%)`
}

export function getColorHsl () {
  const createColor = []
  for (const index in colors) {
    createColor.push(getColor(index))
  }
}
