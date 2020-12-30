/**
 * toFied 四舍五入，消除精度丢失
 * @param {*} number
 * @param {Number} point
 */
export function toFixed (number, point = 2) {
  const numArr = Number(number).toFixed(point + 1).split('.')
  // 判断个位大于等于5，加1
  if (numArr.length > 1 && Number(numArr[1]) % 10 >= 5) numArr[1] = Number(numArr[1]) + 1
  const parseFloatData = Number(numArr.join('.')).toFixed(point)
  return parseFloat(parseFloatData)
}

/**
 * @description 获取退单指标
 * @param {*} req 
 */
export function summation () {
  // 第一次执行时，定义一个数组专门用来存储所有的参数
  const _args = [].slice.call(arguments)
  // 在内部声明一个函数，利用闭包的特性保存_args并收集所有的参数值,执行时已经收集所有参数为数组
  const adder = function () {
    const _adder = function () {
      // 执行收集动作，每次传入的参数都累加到原参数
      [].push.apply(_args, [].slice.call(arguments))
      return _adder
    }
    // 利用隐式转换的特性，当最后执行时隐式转换，并计算最终的值返回
    _adder.toResult = function () {
      return _args.reduce(function (a, b) {
        const sum = (Number(a) || 0) * 100 + (Number(b) || 0) * 100
        return toFixed(sum / 100, 3)
      })
    }
    return _adder
  }

  return adder(_args)
}
