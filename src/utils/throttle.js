/**
 * @description 防止抖动
 * @param {*} fn
 * @param {*} delay
 */
export function debounce (fn, delay) {
  let timer = null
  return function () {
    let _this = this
    let _args = arguments
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
  let last = 0
  return function () {
    let cur = +new Date()
    if (cur - last > delay) {
      fn.apply()
      last = cur
    }
  }
}
