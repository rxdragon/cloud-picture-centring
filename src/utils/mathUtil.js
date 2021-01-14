/**
 * toFied 四舍五入，消除精度丢失
 * @param {*} number
 * @param {Number} point
 */
export function toFixed (number, point = 2) {
  if (isNaN(number)) {
    number = 0
  }
  let result = Number(number).toString()
  const arr = result.split('.')
  const integer = arr[0]
  const decimal = arr[1] || '0'
  result = integer + '.' + decimal.substr(0, point)
  const last = decimal.substr(point, 1)

  // 四舍五入，转换为整数再处理，避免浮点数精度的损失
  if (parseInt(last, 10) >= 5) {
    const x = Math.pow(10, point)
    result = ((parseFloat(result) * x) + 1) / x
    result = result.toFixed(point)
  }

  return Number(result)
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
