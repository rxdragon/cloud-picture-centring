/**
 * @description 额外错误
 */
export const ErrorCode = [
  0xA11003013,
  0xA11003018
]

/**
 * @description 异常处理
 * @param {*} errorCode 
 * @param {*} errorMsg 
 */
export function extraErrorHandle (errorCode, errorMsg) {
  switch (errorCode) {
    case 0xA11003013:
      return `${errorMsg}非本组伙伴`
    case 0xA11003018:
      return `${errorMsg}非本组伙伴`
    default:
      return '异常'
  }
}
