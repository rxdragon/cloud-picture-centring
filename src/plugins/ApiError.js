// 封装继承

export default class ApiError extends Error {
  name = 'ApiError'
  message = ''

  constructor (message) {
    super()
    this.message = message
  }
}
