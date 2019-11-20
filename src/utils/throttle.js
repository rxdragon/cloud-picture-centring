/**
 * @description 防止抖动
 * @param {*} fn
 * @param {*} delay
 */
export function debounce (fn, delay) {
  var timer = null
  return function () {
    var _this = this
    var _args = arguments
    // 清除上一个timer
    clearTimeout(timer)
    // 当最后回调时，经过delay毫秒后执行事件处理程序
    timer = setTimeout(function () {
      fn.apply(_this, _args)
    }, delay)
  }
}

/**
 * @description 节流
 * @param {*} fn
 * @param {*} delay
 */
export const throttle = function (fn, delay) {
  var last = 0
  return function () {
    var cur = +new Date()
    if (cur - last > delay) {
      fn.apply()
      last = cur
    }
  }
}
