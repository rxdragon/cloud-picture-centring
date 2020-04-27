const colors = [0, 29, 47, 86, 120, 146, 169, 194, 220, 236, 262, 289, 314, 342]


/**
 * @description 获取颜色
 * @param {*} index 
 */
export function getColor (index) {
  return `hsl(${colors[index]}, 78%, 63%)`
}

export function getColorNear (paramIndex, selfIndex) {
  const h = colors[paramIndex]
  const newH = h + 15 * (selfIndex + 1)
  return `hsl(${newH}, 78%, 58%)`
}

export function getColorHsl () {
  const createColor = []
  for (const index in colors) {
    createColor.push(getColor(index))
  }
}
