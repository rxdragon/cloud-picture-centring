function assertPath (path) {
  if (typeof path !== 'string') {
    throw new TypeError('Path must be a string. Received ' + path)
  }
}

function posix (path) {
  assertPath(path)
  if (path.length === 0) { return '.' }
  var code = path.charCodeAt(0)
  var hasRoot = (code === 47/* /*/)
  var end = -1
  var matchedSlash = true
  for (var i = path.length - 1; i >= 1; --i) {
    code = path.charCodeAt(i)
    if (code === 47/* /*/) {
      if (!matchedSlash) {
        end = i
        break
      }
    } else {
      // We saw the first non-path separator
      matchedSlash = false
    }
  }

  if (end === -1) { return hasRoot ? '/' : '.' }
  if (hasRoot && end === 1) { return '//' }
  return path.slice(0, end)
}

function win32 (path) {
  assertPath(path)
  var len = path.length
  if (len === 0) { return '.' }
  var rootEnd = -1
  var end = -1
  var matchedSlash = true
  var offset = 0
  var code = path.charCodeAt(0)

  // Try to match a root
  if (len > 1) {
    if (code === 47/* /*/ || code === 92/* \*/) {
      // Possible UNC root

      rootEnd = offset = 1

      code = path.charCodeAt(1)
      if (code === 47/* /*/ || code === 92/* \*/) {
        // Matched double path separator at beginning
        var j = 2
        var last = j
        // Match 1 or more non-path separators
        for (; j < len; ++j) {
          code = path.charCodeAt(j)
          if (code === 47/* /*/ || code === 92/* \*/) { break }
        }
        if (j < len && j !== last) {
          // Matched!
          last = j
          // Match 1 or more path separators
          for (; j < len; ++j) {
            code = path.charCodeAt(j)
            if (code !== 47/* /*/ && code !== 92/* \*/) { break }
          }
          if (j < len && j !== last) {
            // Matched!
            last = j
            // Match 1 or more non-path separators
            for (; j < len; ++j) {
              code = path.charCodeAt(j)
              if (code === 47/* /*/ || code === 92/* \*/) { break }
            }
            if (j === len) {
              // We matched a UNC root only
              return path
            }
            if (j !== last) {
              // We matched a UNC root with leftovers

              // Offset by 1 to include the separator after the UNC root to
              // treat it as a "normal root" on top of a (UNC) root
              rootEnd = offset = j + 1
            }
          }
        }
      }
    } else if ((code >= 65/* A*/ && code <= 90/* Z*/) ||
               (code >= 97/* a*/ && code <= 122/* z*/)) {
      // Possible device root

      code = path.charCodeAt(1)
      if (path.charCodeAt(1) === 58/* :*/) {
        rootEnd = offset = 2
        if (len > 2) {
          code = path.charCodeAt(2)
          if (code === 47/* /*/ || code === 92/* \*/) { rootEnd = offset = 3 }
        }
      }
    }
  } else if (code === 47/* /*/ || code === 92/* \*/) {
    return path[0]
  }

  for (var i = len - 1; i >= offset; --i) {
    code = path.charCodeAt(i)
    if (code === 47/* /*/ || code === 92/* \*/) {
      if (!matchedSlash) {
        end = i
        break
      }
    } else {
      // We saw the first non-path separator
      matchedSlash = false
    }
  }

  if (end === -1) {
    if (rootEnd === -1) { return '.' } else { end = rootEnd }
  }
  return path.slice(0, end)
}
/**
 * @description 获取拓展名
 * @param {*} path
 */
export function getDirname (path) {
  return process.platform === 'win32' ? win32(path) : posix(path)
}

/**
 * @description 获取extname
 * @param {*} path
 */
export function getExtName (path) {
  if (typeof path !== 'string') path = path + ''
  let startDot = -1
  let startPart = 0
  let end = -1
  let matchedSlash = true
  // Track the state of characters (if any) we see before our first dot and
  // after any path separator we find
  let preDotState = 0
  for (let i = path.length - 1; i >= 0; --i) {
    const code = path.charCodeAt(i)
    if (code === 47 /* /*/) {
      // If we reached a path separator that was not part of a set of path
      // separators at the end of the string, stop now
      if (!matchedSlash) {
        startPart = i + 1
        break
      }
      continue
    }
    if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // extension
      matchedSlash = false
      end = i + 1
    }
    if (code === 46 /* .*/) {
      // If this is our first dot, mark it as the start of our extension
      if (startDot === -1) { startDot = i } else if (preDotState !== 1) { preDotState = 1 }
    } else if (startDot !== -1) {
      // We saw a non-dot and non-path separator before our dot, so we should
      // have a good chance at having a non-empty extension
      preDotState = -1
    }
  }

  if (startDot === -1 || end === -1 ||
      // We saw a non-dot character immediately before the dot
      preDotState === 0 ||
      // The (right-most) trimmed path component is exactly '..'
      preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
    return ''
  }
  return path.slice(startDot, end)
}

/**
 * @description 文件名字
 * @param {*} path
 */
function basename (path) {
  if (typeof path !== 'string') path = path + ''

  let start = 0
  let end = -1
  let matchedSlash = true
  let i

  for (i = path.length - 1; i >= 0; --i) {
    if (path.charCodeAt(i) === 47 /* /*/) {
      // If we reached a path separator that was not part of a set of path
      // separators at the end of the string, stop now
      if (!matchedSlash) {
        start = i + 1
        break
      }
    } else if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // path component
      matchedSlash = false
      end = i + 1
    }
  }

  if (end === -1) return ''
  return path.slice(start, end)
}

export function getBaseName (path, ext) {
  let f = basename(path)
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length)
  }
  return f
}

function isAbsolute (path) {
  return path.charAt(0) === '/'
}

function normalizeArray (parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  let up = 0
  for (let i = parts.length - 1; i >= 0; i--) {
    const last = parts[i]
    if (last === '.') {
      parts.splice(i, 1)
    } else if (last === '..') {
      parts.splice(i, 1)
      up++
    } else if (up) {
      parts.splice(i, 1)
      up--
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..')
    }
  }

  return parts
}

// String.prototype.substr - negative index don't work in IE8
const substr = 'ab'.substr(-1) === 'b'
  ? function (str, start, len) { return str.substr(start, len) }
  : function (str, start, len) {
    if (start < 0) start = str.length + start
    return str.substr(start, len)
  }

function normalize (path) {
  const trailingSlash = substr(path, -1) === '/'
  const isAbsolutePath = isAbsolute(path)
  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function (p) {
    return !!p
  }), !isAbsolutePath).join('/')

  if (!path && !isAbsolutePath) {
    path = '.'
  }
  if (path && trailingSlash) {
    path += '/'
  }
  console.log(isAbsolutePath, 'isAbsolute')
  console.log(path, 'path')
  return (isAbsolutePath ? '/' : '') + path
}

function filter (xs, f) {
  if (xs.filter) return xs.filter(f)
  const res = []
  for (let i = 0; i < xs.length; i++) {
    if (f(xs[i], i, xs)) res.push(xs[i])
  }
  return res
}

export function joinPath () {
  const paths = Array.prototype.slice.call(arguments, 0)
  const data = filter(paths, function (p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings')
    }
    return p
  }).join('/')
  return normalize(data)
}

/**
 * @description 格式化路径
 * @param {*} param0
 */
export function getFormat ({ dir, ext, name }) {
  const fileName = name + ext
  return joinPath(dir, fileName)
}
