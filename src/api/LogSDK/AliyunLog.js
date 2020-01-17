import axios from 'axios'

const logAxios = axios.create()
logAxios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
logAxios.defaults.withCredentials = false
logAxios.interceptors.request.use(
  config => {
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

export default class AliyunLog {
  static logInterval;

  constructor (host, project, logstore, topic) {
    this._host = host
    this._project = project
    this._logstore = logstore
    this._topic = topic

    AliyunLog.startBackgroundPushLog()
  }

  static startBackgroundPushLog () {
    if (!AliyunLog.logInterval) {
      AliyunLog.logInterval = setInterval(AliyunLog.sendFailLog, 10 * 1000)
    }
  }

  static async sendLogs (project, host, logstore, uuid, params) {
    try {
      const urlPrefix = 'https://' + project + '.' + host + '/logstores/' + logstore + '/track?APIVersion=0.6.0'
      const storageKey = `AliyunLog_${uuid}`
      if (!localStorage.getItem(storageKey)) {
        localStorage.setItem(storageKey, JSON.stringify({ project, host, logstore, uuid, params }))
      }

      const url = urlPrefix + '&' + params.join('&')
      await logAxios.get(url)
      localStorage.removeItem(storageKey)
    } catch (e) {
      console.log('log push error: ', e)
    }
  }

  static async sendFailLog () {
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        if (key.startsWith('AliyunLog_')) {
          const { project, host, logstore, uuid, params } = JSON.parse(localStorage.getItem(key))
          params.push(`${encodeURIComponent('__resend__')}=${encodeURIComponent('true')}`)
          await AliyunLog.sendLogs(project, host, logstore, uuid, params)
        }
      }
    }
  }

  static uuidv4 () {
    return 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(/[x]/g, c => (Math.random() * 16 | 0).toString(16))
  }

  log (data) {
    const uuid = AliyunLog.uuidv4()
    const params = []

    data = {
      __uuid__: uuid,
      __topic__: this._topic,
      data: JSON.stringify(data)
    }

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        params.push(`${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
      }
    }

    return AliyunLog.sendLogs(this._project, this._host, this._logstore, uuid, params)
  }
}
