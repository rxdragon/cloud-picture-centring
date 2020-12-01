/**
 * @description 格式化日期
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string}
 */
export function parseTime (time, cFormat) {
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
      time = parseInt(time)
    }
    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value ]
    }
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return time_str
}

/**
 * @description 格式化时间
 * @param {number} time
 * @param {string} option
 * @returns {string}
 */
export function formatTime (time, option) {
  if (('' + time).length === 10) {
    time = parseInt(time) * 1000
  } else {
    time = +time
  }
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return (
      d.getMonth() +
      1 +
      '月' +
      d.getDate() +
      '日' +
      d.getHours() +
      '时' +
      d.getMinutes() +
      '分'
    )
  }
}

/**
 * @description 时间格式化
 * @param {*} params
 */
export function timeFormat (seconds, type, showZero = false) {
  const isShowText = type === 'text'
  const isEnText = type === 'en'
  // 计算
  let i = 0
  let s = parseInt(seconds)
  if (s > 60) {
    i = parseInt(s / 60)
    s = parseInt(s % 60)
  }
  // 补零
  const zero = function (v) {
    if (showZero) {
      return (v >> 0) < 10 ? '0' + v : v
    } else {
      return v
    }
  }
  if (isEnText) {
    return zero(i) + 'min' + zero(s) + 'sec'
  }
  if (isShowText) {
    return zero(i) + '分' + zero(s) + '秒'
  } else {
    return zero(i) + ':' + zero(s)
  }
}

/**
 * @description 输出  天、小时、分钟、秒
 * @param {*} mss
 */
export function formatDuring (mss) {
  const days = parseInt(mss / (1000 * 60 * 60 * 24))
  const hours = parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = parseInt((mss % (1000 * 60)) / 1000)
  let str = ''
  function isNull (t, v) {
    if (t) str += t + v
  }
  isNull(days, ' 天 ')
  isNull(hours, ' 小时 ')
  isNull(minutes, ' 分钟 ')
  isNull(seconds, ' 秒 ')
  return str || 0
  // return  days + " 天 " + hours + " 小时 " + minutes + " 分钟 " + seconds + " 秒 "
}

/**
 * 下划线转驼峰
 * @param {*} name
 */
export function toHump (name) {
  return name.replace(/\_(\w)/g, function (all, letter) {
    return letter.toUpperCase()
  })
}

/**
 * 下划线转大驼峰
 * @param {*} name
 */
export function toCapitalHump (name) {
  name = name.charAt(0).toUpperCase() + name.slice(1)
  return name.replace(/\_(\w)/g, function (all, letter) {
    return letter.toUpperCase()
  })
}

/**
 * @description 将key 转换为驼峰
 */
export function keyToHump (object) {
  const createData = {}
  for (const key in object) {
    createData[toHump(key)] = object[key]
  }
  return createData
}

/**
 * @description 转换百分比
 * @param {*} value
 */
export function transformPercentage (a, b) {
  a = Number(a)
  b = Number(b)
  if (!a || !b) return '0%'
  const num = a / b * 100
  return num.toFixed(2) + '%'
}

/**
 * @description 判断对象value都是整数
 * @param {*} object
 */
export function objEveryNumberValue (object) {
  const valueArray = Object.values(object)
  return valueArray.every(item => Boolean(Number(item)))
}

export function twoTierObjEveryNumberValue (object) {
  const ObjArray = Object.values(object)
  const isAllHasData = []
  ObjArray.forEach(arrItem => {
    isAllHasData.push(objEveryNumberValue(arrItem))
  })
  return isAllHasData.every(item => item)
}

/**
 * @description 是否为对象
 */
export function isObj (obj) {
  if (!obj) return false
  return Object.prototype.toString.call(obj) === '[object Object]'
}

/**
 * @description 是否为数组
 */
export function isArr (arr) {
  if (!arr) return false
  return Object.prototype.toString.call(arr) === '[object Array]'
}

/**
 * @description 求平均值
 * @param {*} a 总数
 * @param {*} b 基数
 */
export function getAvg (a, b, size = 2) {
  if (!Number(a) || !Number(b)) return '0.00'
  const avg = (Number(a) / Number(b)).toFixed(size)
  return parseFloat(avg)
}
