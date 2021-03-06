import MicroWebSocket from 'mainto-jssdk/socket/MicroWebsocket'
import handleMessage from './handleMessage'
import axios from '@/plugins/axios.js'
import store from '@/store'
import * as SessionTool from '@/utils/sessionTool.js'
import { readConfig } from '@/utils/electronConfig'
import Vue from 'vue'
import { throttle } from '@/utils/throttle'

/**
 * @description 获取ws票据
 */
function getWebSocketSignature () {
  return axios({
    url: '/project_cloud/common/getWebSocketSignature',
    method: 'GET'
  }).then(msg => {
    return msg
  })
}

function getUrlHost (url) {
  return new URL(url).host
}

/**
 * @description 断开连接时候记录日志
 * @param {*} params 
 */
const saveNetworkLog = throttle(() => {
  const userInfo = SessionTool.getUserInfo()
  const name = userInfo.name || userInfo.id || '-'
  Vue.prototype.$ipcRenderer.send('network-diagnose', { name })
}, 5000)

class Ws {
  chat = null
  state = 'unConnect' // unConnect connecting connected
  sendList = [] // 需要发送的消息列表

  constructor () {
    this.connect()
  }
  // 创建websocket
  async createChat () {
    if (!this.chat) {
      console.warn('createChat', '创建websocket')
      try {
        await this.connect()
      } catch (error) {
        console.error(error)
      }
    }
  }

  stopLink () {
    if (this.chat) {
      console.warn('关闭chat')
      this.chat.stop()
      this.chat = null
    }
  }

  setState (webState) {
    this.state = webState
    if (store) {
      store.commit('user/SET_WEB_SCOKET_STATE', webState)
    }
  }

  // 获取chat
  async getChat () {
    if (!this.chat) {
      await this.createChat()
    }
    return this.chat
  }

  // 发送消息
  async sendMessage (msg) {
    console.warn(this.state, 'state')
    console.warn(msg, 'msg')
    if (this.state === 'unConnect') {
      await this.createChat()
    }
    if (this.state === 'connected') {
      this.chat.send(msg)
    } else {
      this.sendList.push(msg)
    }
  }

  async initializeSendMessage (isRetoucher) {
    if (!this.chat) {
      await this.createChat()
    }
    if (!isRetoucher) return
    const firstSendType = [
      'StreamPhotographerOrgReturn',
      'StreamReviewerReturn',
      'StreamRetoucherReceive',
      'StaffAnnouncementUnreadCount'
    ]
    store.dispatch('user/getRetoucherLineState')
    for (const type of firstSendType) {
      this.sendMessage({ typeName: type })
    }
  }

  // 链接websocket
  connect (options) {
    return new Promise(async (resolve, reject) => {
      if (this.state === 'connecting' || this.state === 'connected') {
        return reject('isConnected')
      }
      // 未登录
      const xstreamId = SessionTool.getXStreamId('xStreamId')
      const user = SessionTool.getUserInfo('userInfo')
      if (!xstreamId || !user) {
        return reject('notLogin')
      }
      try {
        this.setState('connecting')
        const WebSocketSignature = await getWebSocketSignature()
        // 初始化socket配置
        const chat = new MicroWebSocket()
        const url = getUrlHost(readConfig('microApi') || process.env.VUE_APP_BASE_API)
        chat.debugMode = false // 是否开启debug模式
        chat.autoReconnect = true // 断线后是否自动链接
        chat.useSafe = true // https 下必开启
        chat.domain = url // websocekt 域名
        chat.roomName = WebSocketSignature.room // 主房间名册
        chat.roomAlias = WebSocketSignature.alias // 子房间名称
        chat.checkStr = WebSocketSignature.check // 密钥
        chat.otherOptions = Object.assign({}, options, {
          expired: WebSocketSignature.expired, // 过期时间
          stream: xstreamId,
          // 后端网关服务兼容
          other: ''
        })
        // 消息到来时触发
        chat.onMessageCallback = data => {
          handleMessage(data, this)
        }

        // websocket第一次连接时调用
        chat.onFirstConnectCallback = () => {
          this.setState('connected')
          console.warn('连接成功', 'onFirstConnectCallback')
          Vue.prototype.$ipcRenderer.send('network-uploadLog')
          Vue.prototype.$ipcRenderer.send('network-nslookup-mainto')

          this.initializeSendMessage(store.state.permission.isRetoucher)
          if (this.sendList.length) {
            this.sendList.map(item => this.sendMessage(item))
            this.sendList = []
          }
        }
        // 错误时触发
        chat.onErrorCallback = () => {
          console.error('错误时触发')
          saveNetworkLog()
          this.setState('unConnect')
        }
        // 断开连接时触发
        chat.onDisconnectCallback = () => {
          console.error('断开连接时触发')
          saveNetworkLog()
          this.setState('unConnect')
        }
        chat.onReConnectCallback = e => {
          console.error('重新连接')
          this.setState('connected')
          Vue.prototype.$ipcRenderer.send('network-uploadLog')
          this.initializeSendMessage(store.state.permission.isRetoucher)
        }
        // 连接到远程服务器
        chat.start()
        this.chat = chat
        resolve()
      } catch (error) {
        console.error(error)
      }
    })
  }
}
export default Ws
